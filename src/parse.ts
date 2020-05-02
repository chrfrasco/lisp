import {
  Token,
  TokenKind,
  KeywordToken,
  IdentifierToken,
  OperatorToken,
} from "./tokens";
import { UnreachableError } from "./preconditions";
import { ErrorAtLocation } from "./error_at_location";
import { Location, ImmutableLocation } from "./reader";

export enum ASTNodeKind {
  PROGRAM = "PROGRAM",
  NUMBER_LITERAL = "NUMBER_LITERAL",
  STRING_LITERAL = "STRING_LITERAL",
  BOOLEAN_LITERAL = "BOOLEAN_LITERAL",
  CALL_EXPRESSION = "CALL_EXPRESSION",
  VARIABLE_ASSIGNMENT = "VARIABLE_ASSIGNMENT",
  FUNCTION_DECLARATION = "FUNCTION_DECLARATION",
  IDENTIFIER = "IDENTIFIER",
}

export type ASTNode = { location: Location } & (
  | {
      type: ASTNodeKind.FUNCTION_DECLARATION;
      name: string;
      params: readonly string[];
      body: ASTNode;
    }
  | { type: ASTNodeKind.PROGRAM; body: readonly ASTNode[] }
  | { type: ASTNodeKind.VARIABLE_ASSIGNMENT; name: string; value: ASTNode }
  | {
      type: ASTNodeKind.CALL_EXPRESSION;
      name: string;
      params: readonly ASTNode[];
    }
  | {
      type:
        | ASTNodeKind.STRING_LITERAL
        | ASTNodeKind.BOOLEAN_LITERAL;
      value: string;
    }
  | { type: ASTNodeKind.NUMBER_LITERAL, value: number }
  | {
      type: ASTNodeKind.IDENTIFIER;
      value: string;
    }
);

export type FunctionDeclarationNode = Extract<
  ASTNode,
  { type: ASTNodeKind.FUNCTION_DECLARATION }
>;

export type CallExpressionNode = Extract<
  ASTNode,
  { type: ASTNodeKind.CALL_EXPRESSION }
>;

export type IdentifierNode = Extract<ASTNode, { type: ASTNodeKind.IDENTIFIER }>;

export const ASTNodeBuilders = {
  program(body: readonly ASTNode[], location: Location): ASTNode {
    return { type: ASTNodeKind.PROGRAM, location, body };
  },
  variableAssignment(
    name: string,
    value: ASTNode,
    location: Location
  ): ASTNode {
    return { type: ASTNodeKind.VARIABLE_ASSIGNMENT, location, name, value };
  },
  callExpression(
    name: string,
    params: readonly ASTNode[],
    location: Location
  ): CallExpressionNode {
    return { type: ASTNodeKind.CALL_EXPRESSION, location, name, params };
  },
  stringLiteral(value: string, location: Location): ASTNode {
    return { type: ASTNodeKind.STRING_LITERAL, location, value };
  },
  numberLiteral(value: number, location: Location): ASTNode {
    return { type: ASTNodeKind.NUMBER_LITERAL, location, value };
  },
  booleanLiteral(value: string, location: Location): ASTNode {
    return { type: ASTNodeKind.BOOLEAN_LITERAL, location, value };
  },
  identifier(value: string, location: Location): IdentifierNode {
    return { type: ASTNodeKind.IDENTIFIER, location, value };
  },
  functionDeclaration(
    name: string,
    params: readonly string[],
    body: ASTNode,
    location: Location
  ): FunctionDeclarationNode {
    return {
      type: ASTNodeKind.FUNCTION_DECLARATION,
      location,
      name,
      params,
      body,
    };
  },
};

export class ParseError extends ErrorAtLocation {
  constructor(token: Token) {
    super(`unexpected token of type ${token.type}`, token.location);
  }
}

export default function parse(tokensWithNewlines: readonly Token[]) {
  // newline tokens offer no information about the program
  // TODO: consider removing newline tokens altogether
  const tokens = tokensWithNewlines.filter(token => token.type !== TokenKind.NEWLINE);
  let current = 0;

  function walk(): ASTNode {
    let token = tokens[current];

    if (token.type === TokenKind.NUMBER) {
      current++;
      return ASTNodeBuilders.numberLiteral(token.value, token.location);
    }

    if (token.type === TokenKind.STRING) {
      current++;
      return ASTNodeBuilders.stringLiteral(token.value, token.location);
    }

    if (token.type === TokenKind.PAREN && token.value === "(") {
      token = tokens[++current];

      if (token.type === TokenKind.KEYWORD) {
        return handleKeyword(token);
      }

      if (
        token.type === TokenKind.IDENTIFIER ||
        token.type === TokenKind.OPERATOR
      ) {
        return handleCallExpression(token);
      }

      throw new ParseError(token);
    }

    if (token.type === TokenKind.IDENTIFIER) {
      current++;
      return ASTNodeBuilders.identifier(token.value, token.location);
    }

    throw new ParseError(token);
  }

  function handleKeyword(token: KeywordToken): ASTNode {
    switch (token.value) {
      case "def": {
        return handleVariableAssignment();
      }
      case "fn": {
        return handleFunctionDeclaration();
      }
      default:
        throw new UnreachableError(token.value);
    }
  }

  function handleVariableAssignment(): ASTNode {
    let token = tokens[++current];
    if (token.type !== TokenKind.IDENTIFIER) {
      throw new ParseError(token);
    }
    const name = token.value;
    current++;
    const node = ASTNodeBuilders.variableAssignment(
      name,
      walk(),
      token.location
    );
    current++;
    return node;
  }

  function handleFunctionDeclaration(): ASTNode {
    let token = tokens[++current];
    if (token.type !== TokenKind.IDENTIFIER) {
      throw new ParseError(token);
    }
    const name = token.value;

    token = tokens[++current];
    if (!(token.type === TokenKind.PAREN && token.value === "[")) {
      throw new ParseError(token);
    }

    let params = [];
    token = tokens[++current];
    while (token.type === TokenKind.IDENTIFIER) {
      params.push(token.value);
      token = tokens[++current];
    }

    if (!(token.type === TokenKind.PAREN && token.value === "]")) {
      throw new ParseError(token);
    }
    current++;

    const node = ASTNodeBuilders.functionDeclaration(
      name,
      params,
      walk(),
      token.location
    );

    current++;
    return node;
  }

  function handleCallExpression(
    callingToken: IdentifierToken | OperatorToken
  ): ASTNode {
    const params: ASTNode[] = [];
    const name = callingToken.value;
    const location = callingToken.location;

    let token = tokens[++current];
    while (
      token.type !== TokenKind.PAREN ||
      (token.type === TokenKind.PAREN && token.value !== ")")
    ) {
      params.push(walk());
      token = tokens[current];
    }

    current++;
    return ASTNodeBuilders.callExpression(name, params, location);
  }

  function haveMoreTokens() {
    return current < tokens.length;
  }

  const body: ASTNode[] = [];
  while (haveMoreTokens()) {
    body.push(walk());
  }

  return ASTNodeBuilders.program(body, new ImmutableLocation(0, 0, 0));
}
