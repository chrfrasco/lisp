import lexer from "./lexer";
import parser from "./parse";
import run from "./run";
import { Scope } from "./scope";

export default function lisp(input: string, globals = Scope.prelude()) {
  return pipe(lexer, parser, ast => run(ast, globals))(input);
}

function pipe(...functions: ((...args: any[]) => any)[]) {
  return (initial: any) =>
    functions.reduce((value, nextFn) => nextFn(value), initial);
}
