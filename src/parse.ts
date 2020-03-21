import {
  Token,
  TokenKind,
  KeywordToken,
  IdentifierToken,
  OperatorToken
} from "./tokens";
import { UnreachableError, Preconditions } from "./preconditions";
import { ErrorAtLocation } from "./error_at_location";
import { Location, ImmutableLocation } from "./reader";

export enum ASTNodeKind {
  PROGRAM = "PROGRAM",
  NUMBER_LITERAL = "NUMBER_LITERAL",
  STRING_LITERAL = "STRING_LITERAL",
  CALL_EXPRESSION = "CALL_EXPRESSION",
  VARIABLE_ASSIGNMENT = "VARIABLE_ASSIGNMENT",
  FUNCTION_DECLARATION = "FUNCTION_DECLARATION",
  IDENTIFIER = "IDENTIFIER"
}

export type ASTNode = { location: Location }
  & ({
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
        | ASTNodeKind.NUMBER_LITERAL
        | ASTNodeKind.IDENTIFIER;
      value: string;
    });

export type FunctionNode = Extract<ASTNode, { type: ASTNodeKind.FUNCTION_DECLARATION }>;

export const ASTNodes = {
  program(body: readonly ASTNode[], location: Location): ASTNode {
    return { type: ASTNodeKind.PROGRAM, location, body };
  },
  variableAssignment(name: string, value: ASTNode, location: Location): ASTNode {
    return { type: ASTNodeKind.VARIABLE_ASSIGNMENT, location, name, value };
  },
  callExpression(name: string, params: readonly ASTNode[], location: Location): ASTNode {
    return { type: ASTNodeKind.CALL_EXPRESSION, location, name, params };
  },
  stringLiteral(value: string, location: Location): ASTNode {
    return { type: ASTNodeKind.STRING_LITERAL, location, value };
  },
  numberLiteral(value: string, location: Location): ASTNode {
    return { type: ASTNodeKind.NUMBER_LITERAL, location, value };
  },
  identifier(value: string, location: Location): ASTNode {
    return { type: ASTNodeKind.IDENTIFIER, location, value };
  },
  functionDeclaration(
    name: string,
    params: readonly string[],
    body: ASTNode, location: Location
  ): FunctionNode {
    return { type: ASTNodeKind.FUNCTION_DECLARATION, location, name, params, body };
  }
};

class ParseError extends ErrorAtLocation {
  constructor(token: Token) {
    super(`unexpected token of type ${token.type}`, token.location);
  }
}

export default function parse(tokens: readonly Token[]) {
  let current = 0;

  function walk(): ASTNode {
    let token = tokens[current];
    while (token.type === TokenKind.NEWLINE) {
      token = tokens[++current];
    }

    if (token.type === TokenKind.NUMBER) {
      current++;
      return ASTNodes.numberLiteral(token.value, token.location);
    }

    if (token.type === TokenKind.STRING) {
      current++;
      return ASTNodes.stringLiteral(token.value, token.location);
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
      return ASTNodes.identifier(token.value, token.location);
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
    Preconditions.checkState(
      token.type === TokenKind.IDENTIFIER,
      `expected IDENTIFIER, got ${token.type}: ${token}`
    );
    const name = token.value;
    current++;
    const node = ASTNodes.variableAssignment(name, walk(), token.location);
    current++;
    return node;
  }

  function handleFunctionDeclaration(): ASTNode {
    let token = tokens[++current];
    Preconditions.checkState(
      token.type === TokenKind.IDENTIFIER,
      `expected IDENTIFIER, got ${token.type}: ${token}`
    );
    const name = token.value;

    let params = [];
    token = tokens[++current];
    while (token.type === TokenKind.PARAMETER) {
      params.push(token.value);
      token = tokens[++current];
    }

    const node = ASTNodes.functionDeclaration(name, params, walk(), token.location);

    current++;
    return node;
  }

  function handleCallExpression(
    callingToken: IdentifierToken | OperatorToken
  ): ASTNode {
    const params: ASTNode[] = [];
    const name = callingToken.value;

    let token = tokens[++current];
    while (
      token.type !== TokenKind.PAREN ||
      (token.type === TokenKind.PAREN && token.value !== ")")
    ) {
      params.push(walk());
      token = tokens[current];
    }

    current++;
    return ASTNodes.callExpression(name, params, token.location);
  }

  const body: ASTNode[] = [];
  while (current < tokens.length) {
    body.push(walk());
  }

  return ASTNodes.program(body, new ImmutableLocation(0, 0, 0));
}
