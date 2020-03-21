import { Token, TokenKind, KeywordToken, IdentifierToken, OperatorChar, OperatorToken } from "./tokens";
import { UnreachableError, Preconditions } from "./preconditions";

export enum ASTNodeKind {
  PROGRAM = "PROGRAM",
  NUMBER_LITERAL = "NUMBER_LITERAL",
  STRING_LITERAL = "STRING_LITERAL",
  CALL_EXPRESSION = "CALL_EXPRESSION",
  VARIABLE_ASSIGNMENT = "VARIABLE_ASSIGNMENT",
  FUNCTION_DECLARATION = "FUNCTION_DECLARATION",
  IDENTIFIER = "IDENTIFIER"
}

export type FunctionNode = {
  type: ASTNodeKind.FUNCTION_DECLARATION;
  name: string;
  params: readonly string[];
  body: ASTNode;
};

export type ASTNode =
  | FunctionNode
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
    };

export const ASTNodes = {
  program(body: readonly ASTNode[]): ASTNode {
    return { type: ASTNodeKind.PROGRAM, body };
  },
  variableAssignment(name: string, value: ASTNode): ASTNode {
    return { type: ASTNodeKind.VARIABLE_ASSIGNMENT, name, value };
  },
  callExpression(name: string, params: readonly ASTNode[]): ASTNode {
    return { type: ASTNodeKind.CALL_EXPRESSION, name, params };
  },
  stringLiteral(value: string): ASTNode {
    return { type: ASTNodeKind.STRING_LITERAL, value };
  },
  numberLiteral(value: string): ASTNode {
    return { type: ASTNodeKind.NUMBER_LITERAL, value };
  },
  identifier(value: string): ASTNode {
    return { type: ASTNodeKind.IDENTIFIER, value };
  },
  functionDeclaration(
    name: string,
    params: readonly string[],
    body: ASTNode
  ): FunctionNode {
    return { type: ASTNodeKind.FUNCTION_DECLARATION, name, params, body };
  }
};

export default function parse(tokens: readonly Token[]) {
  let current = 0;

  function walk(): ASTNode {
    let token = tokens[current];
    while (token.type === TokenKind.NEWLINE) {
      token = tokens[++current];
    }

    if (token.type === TokenKind.NUMBER) {
      current++;
      return ASTNodes.numberLiteral(token.value);
    }

    if (token.type === TokenKind.STRING) {
      current++;
      return ASTNodes.stringLiteral(token.value);
    }

    if (token.type === TokenKind.PAREN && token.value === "(") {
      token = tokens[++current];

      if (token.type === TokenKind.KEYWORD) {
        return handleKeyword(token);
      }

      if (token.type === TokenKind.IDENTIFIER || token.type === TokenKind.OPERATOR) {
        return handleCallExpression(token);
      }

      throw new ParseError(token);
    }

    if (token.type === TokenKind.IDENTIFIER) {
      current++;
      return ASTNodes.identifier(token.value);
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
    const node = ASTNodes.variableAssignment(name, walk());
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

    const node = ASTNodes.functionDeclaration(name, params, walk());

    current++;
    return node;
  }

  function handleCallExpression(callingToken: IdentifierToken | OperatorToken): ASTNode {
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
    return ASTNodes.callExpression(name, params);
  }

  const body: ASTNode[] = [];
  while (current < tokens.length) {
    body.push(walk());
  }

  return ASTNodes.program(body);
}

export class ParseError extends Error {
  constructor(private readonly token: Token) {
    super(`unexpected token of type ${token.type}`);
  }
}
