import lexer from "./lexer";
import parser from "./parse";
import run from "./run";
import { Scope, RuntimeValue, RuntimeValueBuilders } from "./scope";
import { ErrorAtLocation } from "./error_at_location";

export function evaluate(
  source: string,
  globals = Scope.prelude()
): RuntimeValue {
  try {
    const tokens = lexer(source);
    const ast = parser(tokens);
    return run(ast, globals);
  } catch (error) {
    if (error instanceof ErrorAtLocation) {
      console.error(error.printWithSource(source));
    }
  }

  return RuntimeValueBuilders.nil();
}
