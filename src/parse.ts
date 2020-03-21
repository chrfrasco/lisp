import { Token, TokenKind } from "./lexer";
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

export default function parse(tokens: readonly Token[]) {
  let current = 0;

  function walk(): ASTNode {
    let token = tokens[current];

    if (token.type === TokenKind.NUMBER) {
      current++;
      return {
        type: ASTNodeKind.NUMBER_LITERAL,
        value: token.value
      };
    }

    if (token.type === TokenKind.STRING) {
      current++;
      return {
        type: ASTNodeKind.STRING_LITERAL,
        value: token.value
      };
    }

    if (token.type === TokenKind.PAREN && token.value === "(") {
      token = tokens[++current];

      let node: ASTNode;
      if (token.type === TokenKind.KEYWORD) {
        switch (token.value) {
          case "def": {
            node = handleVariableAssignment();
            break;
          }
          case "fn": {
            node = handleFunctionDeclaration();
            break;
          }
          default:
            throw new UnreachableError(token.value);
        }
      } else {
        node = handleCallExpression();
      }

      return node;
    }

    if (token.type === TokenKind.IDENTIFIER) {
      current++;
      return {
        type: ASTNodeKind.IDENTIFIER,
        value: token.value
      };
    }

    throw new TypeError(
      `unhandled token of type ${token.type}: ${token.value}`
    );
  }

  function handleVariableAssignment(): ASTNode {
    let token = tokens[++current];
    Preconditions.checkState(
      token.type === TokenKind.IDENTIFIER,
      `expected IDENTIFIER, got ${token.type}: ${token.value}`
    );
    const name = token.value;
    current++;
    const node: ASTNode = {
      name,
      type: ASTNodeKind.VARIABLE_ASSIGNMENT,
      value: walk()
    };
    current++;
    return node;
  }

  function handleFunctionDeclaration(): ASTNode {
    let token = tokens[++current];

    Preconditions.checkState(
      token.type === TokenKind.IDENTIFIER,
      "expected a name"
    );
    const name = token.value;

    let params = [];
    token = tokens[++current];
    while (token.type === TokenKind.PARAMETER) {
      params.push(token.value);
      token = tokens[++current];
    }

    const node: ASTNode = {
      type: ASTNodeKind.FUNCTION_DECLARATION,
      name,
      params,
      body: walk()
    };

    current++;
    return node;
  }

  function handleCallExpression(): ASTNode {
    let token = tokens[current];
    const params: ASTNode[] = [];
    const name = token.value;

    token = tokens[++current];
    while (
      token.type !== TokenKind.PAREN ||
      (token.type === TokenKind.PAREN && token.value !== ")")
    ) {
      params.push(walk());
      token = tokens[current];
    }

    current++;
    return {
      type: ASTNodeKind.CALL_EXPRESSION,
      name,
      params
    };
  }

  const body: ASTNode[] = [];
  while (current < tokens.length) {
    body.push(walk());
  }

  return { type: ASTNodeKind.PROGRAM, body };
}
