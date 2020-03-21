export class Reader {
  constructor(
    private readonly source: string,
    private readonly location: MutableLocation
  ) {}

  currentLocation(): Location {
    return this.location.snapshot();
  }

  peek(ahead: number = 0): string {
    return this.source[this.location.offset + ahead];
  }

  next(): string {
    if (this.peek() === '\n') {
      this.location.nextLine();
      return this.peek();
    }

    this.location.nextChar();
    return this.peek();
  }

  hasMoreChars(): boolean {
    return this.location.offset < this.source.length;
  }

  takeCharsWhile(predicate: (char: string) => boolean) {
    let value = "";
    while (this.hasMoreChars() && predicate(this.peek())) {
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
    return new ImmutableLocation(this.offset, this.charInLine, this.line);
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
