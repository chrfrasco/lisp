import { TokenKind } from "./lexer";
import { ASTNodeKind } from "./parse";

export const NUMBER = TokenKind.NUMBER;
export const STRING = TokenKind.STRING;
export const PAREN = TokenKind.PAREN;
export const OPERATOR = TokenKind.OPERATOR;
export const IDENTIFIER = TokenKind.IDENTIFIER;
export const KEYWORD = TokenKind.KEYWORD;
export const PARAMETER = TokenKind.PARAMETER;

export const PROGRAM = ASTNodeKind.PROGRAM;
export const NUMBER_LITERAL = ASTNodeKind.NUMBER_LITERAL;
export const STRING_LITERAL = ASTNodeKind.STRING_LITERAL;
export const CALL_EXPRESSION = ASTNodeKind.CALL_EXPRESSION;
export const VARIABLE_ASSIGNMENT = ASTNodeKind.VARIABLE_ASSIGNMENT;
export const FUNCTION_DECLARATION = ASTNodeKind.FUNCTION_DECLARATION;

export const KEYWORDS = {
  def: VARIABLE_ASSIGNMENT,
  fn: FUNCTION_DECLARATION
};

export const DEFAULT_GLOBALS = {
  print: console.log.bind(console),
  "+": (a, b) => a + b,
  "*": (a, b) => a * b,
  "-": (a, b) => a - b,
  "/": (a, b) => a / b,
  pow: (a, b) => a ** b
};
