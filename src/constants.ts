import { TokenKind } from "./lexer";

export const NUMBER = TokenKind.NUMBER;
export const STRING = TokenKind.STRING;
export const PAREN = TokenKind.PAREN;
export const OPERATOR = TokenKind.OPERATOR;
export const IDENTIFIER = TokenKind.IDENTIFIER;
export const KEYWORD = TokenKind.KEYWORD;
export const PARAMETER = TokenKind.PARAMETER;

export const PROGRAM = "PROGRAM";
export const NUMBER_LITERAL = "NUMBER_LITERAL";
export const STRING_LITERAL = "STRING_LITERAL";
export const CALL_EXPRESSION = "CALL_EXPRESSION";
export const VARIABLE_ASSIGNMENT = "VARIABLE_ASSIGNMENT";
export const FUNCTION_DECLARATION = "FUNCTION_DECLARATION";

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
