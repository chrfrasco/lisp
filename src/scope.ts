import { Preconditions } from "./preconditions";

export enum RuntimeValueKind {
  STRING = "STRING",
  NUMBER = "NUMBER",
  FUNCTION = "FUNCTION",
  NIL = "NIL"
}

export type RuntimeFunctionValue = {
  kind: RuntimeValueKind.FUNCTION;
  value: (...args: RuntimeValue[]) => RuntimeValue;
};

export type RuntimeValue =
  | RuntimeFunctionValue
  | { kind: RuntimeValueKind.NUMBER; value: number }
  | { kind: RuntimeValueKind.STRING; value: string }
  | { kind: RuntimeValueKind.NIL };

export const RuntimeValueBuilders = {
  function(
    value: (...args: RuntimeValue[]) => RuntimeValue
  ): RuntimeFunctionValue {
    return { kind: RuntimeValueKind.FUNCTION, value };
  },
  number(value: number): RuntimeValue {
    return { kind: RuntimeValueKind.NUMBER, value };
  },
  string(value: string): RuntimeValue {
    return { kind: RuntimeValueKind.STRING, value };
  },
  nil(): RuntimeValue {
    return { kind: RuntimeValueKind.NIL };
  }
};

export function jsPrimitiveFor(value: RuntimeValue): any {
  if (value.kind === RuntimeValueKind.NIL) {
    return undefined;
  }
  return value.value;
}

export class Scope {
  private readonly variables: Map<string, RuntimeValue>;

  constructor(variables?: [string, RuntimeValue][]) {
    this.variables = new Map(variables);
  }

  static prelude(): Scope {
    // prettier-ignore
    return new Scope([
      ["print", RuntimeValueBuilders.function((...args) => {
        console.log(...(args.map(jsPrimitiveFor)));
        return RuntimeValueBuilders.nil();
      })],
      ["concat", RuntimeValueBuilders.function((...args) => {
        for (const arg of args) {
          Preconditions.checkState(
            arg.kind === RuntimeValueKind.STRING,
            'concat expects all args to be strings',
          );
        }
        return RuntimeValueBuilders.nil();
      })],
      ["+", makeNumberOperator("+", (a, b) => a + b)],
      ["-", makeNumberOperator("-", (a, b) => a - b)],
      ["*", makeNumberOperator("*", (a, b) => a * b)],
      ["/", makeNumberOperator("/", (a, b) => a / b)],
      ["pow", makeNumberOperator("pow", (a, b) => a ** b)]
    ]);
  }

  static forTesting(printImpl: (...args: any[]) => void): Scope {
    const printValue = RuntimeValueBuilders.function((...args) => {
      printImpl(...args.map(jsPrimitiveFor));
      return RuntimeValueBuilders.nil();
    });
    return Scope.prelude().with([["print", printValue]]);
  }

  with(variables: [string, RuntimeValue][]): Scope {
    return new Scope([...this.variables.entries(), ...variables]);
  }

  get(name: string): RuntimeValue {
    if (!this.variables.has(name)) {
      throw new TypeError(`${name} is not defined`);
    }
    const value = this.variables.get(name);
    Preconditions.checkState(value != null, "expected a value");
    return value;
  }

  assign(name: string, value: RuntimeValue) {
    this.variables.set(name, value);
  }

  includes(name: string): boolean {
    return this.variables.has(name);
  }
}

function makeNumberOperator(
  name: string,
  op: (a: number, b: number) => number
) {
  return RuntimeValueBuilders.function((a: RuntimeValue, b: RuntimeValue) => {
    Preconditions.checkState(
      a.kind === RuntimeValueKind.NUMBER && b.kind === RuntimeValueKind.NUMBER,
      `${name} expects two numbers`
    );
    return RuntimeValueBuilders.number(op(a.value, b.value));
  });
}
