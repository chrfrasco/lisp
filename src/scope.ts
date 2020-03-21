type Value = any;

export class Scope {
  private readonly variables: Map<string, Value>;

  constructor(variables?: [string, Value][]) {
    this.variables = new Map(variables);
  }

  static prelude(): Scope {
    return new Scope([
      ["print", console.log.bind(console)],
      ["+", (a: number, b: number) => a + b],
      ["*", (a: number, b: number) => a * b],
      ["-", (a: number, b: number) => a - b],
      ["/", (a: number, b: number) => a / b],
      ["pow", (a: number, b: number) => a ** b]
    ]);
  }

  with(variables: [string, Value][]): Scope {
    return new Scope([...this.variables.entries(), ...variables]);
  }

  get(name: string): Value {
    return this.variables.get(name);
  }

  assign(name: string, value: Value) {
    this.variables.set(name, value);
  }

  includes(name: string): boolean {
    return this.variables.has(name);
  }
}
