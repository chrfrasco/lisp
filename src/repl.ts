import * as readline from "readline";
import { evaluate } from "./evaluate";
import { RuntimeValues, Scope } from "./scope";
import { ErrorAtLocation } from "./error_at_location";

const lineReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const scope = Scope.prelude();

ask();

function ask() {
  lineReader.question("> ", answer => {
    if (answer === ".exit") {
      process.exit(0);
    }

    if (answer === ".scope") {
      console.log(scope.names().join(" "));
      ask();
      return;
    }

    if (answer !== "") {
      try {
        const result = evaluate(answer, scope);
        console.log(RuntimeValues.repr(result));
      } catch (error) {
        if (error instanceof ErrorAtLocation) {
          console.error(error.printWithSource(answer));
        } else {
          throw error;
        }
      }
    }

    ask();
  });
}
