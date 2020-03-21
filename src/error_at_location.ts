import { Location } from "./reader";

export class ErrorAtLocation extends Error {
  constructor(message: string, readonly location: Location) {
    super(message);
  }

  printWithSource(source: string): string {
    const line = source.split("\n")[this.location.line];
    return (
      line +
      `\n${repeat(" ", this.location.charInLine)}^ ${this.constructor.name}: ${
        this.message
      }`
    );
  }
}

function repeat(s: string, times: number): string {
  return new Array(times).fill(s).join("");
}
