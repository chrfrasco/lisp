export class Reader {
  constructor(
    private readonly source: string,
    private readonly location: MutableLocation
  ) {}

  peek(): string {
    return this.source[this.location.offset];
  }

  next(): string {
    this.location.nextChar();
    return this.peek();
  }

  hasMoreChars(): boolean {
    return this.location.offset < this.source.length;
  }

  takeCharsWhile(predicate: (char: string) => boolean) {
    let value = "";
    while (predicate(this.peek())) {
      value += this.source[this.location.offset];
      this.location.nextChar();
    }
    return value;
  }

}

export interface Location {
  offset: number;
  charInLine: number;
  line: number;
  snapshot(): Location;
}

export class ImmutableLocation implements Location {
  constructor(
    readonly offset: number,
    readonly charInLine: number,
    readonly line: number
  ) {
    Object.freeze(this);
  }

  snapshot() {
    return new ImmutableLocation(this.offset, this.charInLine, this.line);
  }
}

export class MutableLocation implements Location {
  private currentOffset: number = 0;
  private currentCharInLine: number = 0;
  private currentLine: number = 0;

  snapshot(): Location {
    return { ...this };
  }

  nextChar() {
    this.currentOffset++;
    this.currentCharInLine++
  }

  nextLine() {
    this.currentOffset++;
    this.currentCharInLine = 0;
    this.currentLine++;
  }

  get offset() {
    return this.currentOffset;
  }

  get charInLine() {
    return this.currentCharInLine;
  }

  get line() {
    return this.currentLine;
  }
}
