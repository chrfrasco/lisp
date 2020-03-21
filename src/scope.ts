import { UnreachableError } from "./preconditions";

export enum RuntimeValueKind {
  STRING = "STRING",
  NUMBER = "NUMBER",
  FUNCTION = "FUNCTION",
  NIL = "NIL"
}

export type RuntimeFunctionValue = {
  kind: RuntimeValueKind.FUNCTION;
  name: string;
  value: (...args: RuntimeValue[]) => RuntimeValue;
};

export type RuntimeValue =
  | RuntimeFunctionValue
  | { kind: RuntimeValueKind.NUMBER; value: number }
  | { kind: RuntimeValueKind.STRING; value: string }
  | { kind: RuntimeValueKind.NIL };

export const RuntimeValueBuilders = {
  function(
    name: string,
    value: (...args: RuntimeValue[]) => RuntimeValue
  ): RuntimeFunctionValue {
    return { kind: RuntimeValueKind.FUNCTION, name, value };
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

export const RuntimeValues = {
  jsPrimitiveFor(value: RuntimeValue): any {
    if (value.kind === RuntimeValueKind.NIL) {
      return undefined;
    }
    return value.value;
  },
  repr(value: RuntimeValue): string {
    switch (value.kind) {
      case RuntimeValueKind.NUMBER:
        return String(value.value);
      case RuntimeValueKind.STRING:
        return `"` + value.value + `"`;
      case RuntimeValueKind.FUNCTION:
        return `fn ${value.name}`;
      case RuntimeValueKind.NIL:
        return "nil";
      default:
        throw new UnreachableError(value);
    }
  }
};

export class Scope {
  private readonly variables: Map<string, RuntimeValue>;

  constructor(variables?: [string, RuntimeValue][]) {
    this.variables = new Map(variables);
  }

  static prelude(): Scope {
    // prettier-ignore
    return new Scope([
      ["print", RuntimeValueBuilders.function('print', (...args) => {
        console.log(...(args.map(RuntimeValues.jsPrimitiveFor)));
        return RuntimeValueBuilders.nil();
      })],
      ["concat", RuntimeValueBuilders.function('concat', (...args) => {
        for (const arg of args) {
          MismatchedTypesError.assertTypes(
            arg.kind === RuntimeValueKind.STRING,
            'concat expects all args to be strings',
          );
        }
        const concatted = args.map(RuntimeValues.jsPrimitiveFor).join('');
        return RuntimeValueBuilders.string(concatted);
      })],
      ["+", makeNumberOperator("+", (a, b) => a + b)],
      ["-", makeNumberOperator("-", (a, b) => a - b)],
      ["*", makeNumberOperator("*", (a, b) => a * b)],
      ["/", makeNumberOperator("/", (a, b) => a / b)],
      ["pow", makeNumberOperator("pow", (a, b) => a ** b)]
    ]);
  }

  static forTesting(printImpl: (...args: any[]) => void): Scope {
    const printValue = RuntimeValueBuilders.function("print", (...args) => {
      printImpl(...args.map(RuntimeValues.jsPrimitiveFor));
      return RuntimeValueBuilders.nil();
    });
    return Scope.prelude().with([["print", printValue]]);
  }

  names(): string[] {
    return [...this.variables.keys()];
  }

  with(variables: [string, RuntimeValue][]): Scope {
    return new Scope([...this.variables.entries(), ...variables]);
  }

  get(name: string): RuntimeValue | undefined {
    return this.variables.get(name);
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
  return RuntimeValueBuilders.function(
    name,
    (a: RuntimeValue, b: RuntimeValue) => {
      MismatchedTypesError.assertTypes(
        a.kind === RuntimeValueKind.NUMBER &&
          b.kind === RuntimeValueKind.NUMBER,
        `${name} expects two numbers`
      );
      return RuntimeValueBuilders.number(op(a.value, b.value));
    }
  );
}

export class MismatchedTypesError extends Error {
  constructor(message: string) {
    super(message);
  }

  static assertTypes(cond: boolean, message: string): asserts cond {
    if (!cond) {
      throw new MismatchedTypesError(message);
    }
  }
}
