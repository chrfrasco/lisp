import * as readline from "readline";
import { evaluate } from "./evaluate";
import { RuntimeValues } from "./scope";
import { ErrorAtLocation } from "./error_at_location";

const lineReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

ask();

function ask() {
  lineReader.question("> ", answer => {
    if (answer === ".exit") {
      process.exit(0);
    }

    if (answer !== "") {
      try {
        const result = evaluate(answer);
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
