import * as fs from "fs";
import { repl } from "./repl";
import { evaluate } from "./evaluate";
import { ErrorAtLocation } from "./error_at_location";

const [filename] = process.argv.slice(2);
if (filename == null || !fs.existsSync(filename)) {
  repl();
} else {
  const source = fs.readFileSync(filename).toString("utf-8");
  try {
    evaluate(source);
  } catch (error) {
    if (error instanceof ErrorAtLocation) {
      console.error(error.printWithSource(source));
      process.exit(1);
    } else {
      throw error;
    }
  }
}
