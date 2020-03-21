import lex from "./lex";
import parse from "./parse";
import run from "./run";
import { Scope, RuntimeValue } from "./scope";

export function evaluate(
  source: string,
  globals = Scope.prelude()
): RuntimeValue {
  const tokens = lex(source);
  const ast = parse(tokens);
  return run(ast, globals);
}
