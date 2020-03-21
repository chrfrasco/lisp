import lexer from "./lexer";
import parser from "./parse";
import run from "./run";
import { Scope, RuntimeValue } from "./scope";

export function evaluate(
  input: string,
  globals = Scope.prelude()
): RuntimeValue {
  return pipe(lexer, parser, ast => run(ast, globals))(input);
}

function pipe(...functions: ((...args: any[]) => any)[]) {
  return (initial: any) =>
    functions.reduce((value, nextFn) => nextFn(value), initial);
}
