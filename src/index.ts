import lexer from "./lexer";
import parser from "./parse";
import run from "./run";
import * as constants from "./constants";

export default function lisp(input, globals = constants.DEFAULT_GLOBALS) {
  return pipe(lexer, parser, ast => run(ast, globals))(input);
}

function pipe(...functions) {
  return initial => functions.reduce((value, nextFn) => nextFn(value), initial);
}
