const readline = require("readline");
const lisp = require("./index");

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

    const result = lisp(answer);
    if (result != null) {
      console.log(result);
    }

    ask();
  });
}
