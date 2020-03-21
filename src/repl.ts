import * as readline from "readline";
import { evaluate } from "./evaluate";
import { RuntimeValues } from "./scope";

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

    const result = evaluate(answer);
    console.log(RuntimeValues.repr(result));

    ask();
  });
}
