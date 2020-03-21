export const NUMBER = "NUMBER";
export const STRING = "STRING";
export const PAREN = "PAREN";
export const OPERATOR = "OPERATOR";
export const IDENTIFIER = "IDENTIFIER";
export const KEYWORD = "KEYWORD";
export const PARAMETER = "PARAMETER";

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
