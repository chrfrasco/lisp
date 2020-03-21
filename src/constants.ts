import { ASTNodeKind } from "./parse";

export const PROGRAM = ASTNodeKind.PROGRAM;
export const NUMBER_LITERAL = ASTNodeKind.NUMBER_LITERAL;
export const STRING_LITERAL = ASTNodeKind.STRING_LITERAL;
export const CALL_EXPRESSION = ASTNodeKind.CALL_EXPRESSION;
export const VARIABLE_ASSIGNMENT = ASTNodeKind.VARIABLE_ASSIGNMENT;
export const FUNCTION_DECLARATION = ASTNodeKind.FUNCTION_DECLARATION;

export const DEFAULT_GLOBALS: { [key: string]: any } = {
  print: console.log.bind(console),
  "+": (a: number, b: number) => a + b,
  "*": (a: number, b: number) => a * b,
  "-": (a: number, b: number) => a - b,
  "/": (a: number, b: number) => a / b,
  pow: (a: number, b: number) => a ** b
};
