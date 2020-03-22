import { UnreachableError, Preconditions } from "./preconditions";

export enum RuntimeValueKind {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOL = "BOOL",
  FUNCTION = "FUNCTION",
  NIL = "NIL",
}

export type RuntimeFunctionValue = {
  kind: RuntimeValueKind.FUNCTION;
  name: string;
  value: (...args: RuntimeValue[]) => RuntimeValue;
};

export type RuntimeValue =
  | RuntimeFunctionValue
  | { kind: RuntimeValueKind.NUMBER; value: number }
  | { kind: RuntimeValueKind.BOOL; value: boolean }
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
  },
  bool(value: boolean): RuntimeValue {
    return { kind: RuntimeValueKind.BOOL, value }
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
      case RuntimeValueKind.BOOL:
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
      ['nil', RuntimeValueBuilders.nil()],
      ['true', RuntimeValueBuilders.bool(true)],
      ['false', RuntimeValueBuilders.bool(false)],

      ["print", RuntimeValueBuilders.function('print', (...args) => {
        console.log(...(args.map(RuntimeValues.jsPrimitiveFor)));
        return RuntimeValueBuilders.nil();
      })],
      ["concat", RuntimeValueBuilders.function('concat', (...args) => {
        for (const arg of args) {
          WrongTypeError.assertIs(
            RuntimeValueKind.STRING,
            arg,
            'concat expects all args to be strings',
          );
        }
        const concatted = args.map(RuntimeValues.jsPrimitiveFor).join('');
        return RuntimeValueBuilders.string(concatted);
      })],

      // numeric operators
      makeNumberOperator("+", (a, b) => a + b),
      makeNumberOperator("-", (a, b) => a - b),
      makeNumberOperator("*", (a, b) => a * b),
      makeNumberOperator("/", (a, b) => a / b),
      makeNumberOperator("pow", (a, b) => a ** b),

      // comparison operators
      makeComparisonOperator('>', (a, b) => a > b),
      makeComparisonOperator('<', (a, b) => a < b),
      makeComparisonOperator('>=', (a, b) => a >= b),
      makeComparisonOperator('<=', (a, b) => a <= b),
      makeComparisonOperator('=', (a, b) => a === b),

      // boolean operators
      makeBooleanOperator('or', (a, b) => a || b),
      makeBooleanOperator('and', (a, b) => a && b),
      makeBooleanOperator('xor', (a, b) => (a || b) && !(a && b)),
      ['not', RuntimeValueBuilders.function('not', (x) => {
        WrongTypeError.assertIs(RuntimeValueKind.BOOL, x, 'expected x to be a bool');
        return RuntimeValueBuilders.bool(!x.value);
      })],

      // branching logic
      ['if', RuntimeValueBuilders.function('if', (condition, yes, no) => {
        WrongTypeError.assertIs(RuntimeValueKind.BOOL, condition, 'expected condition to be a bool');

        // TODO(christianscott): turn these into runtime errors
        Preconditions.checkState(yes != null, 'if expects a yes argument');
        Preconditions.checkState(no != null, 'if expects a no argument');

        return condition.value ? yes : no;
      })],
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
}

function makeNumberOperator(
  name: string,
  op: (a: number, b: number) => number
): [string, RuntimeFunctionValue] {
  const fn = RuntimeValueBuilders.function(
    name,
    (a: RuntimeValue, b: RuntimeValue) => {
      WrongTypeError.assertIs(RuntimeValueKind.NUMBER, a, `expected a to be a number`);
      WrongTypeError.assertIs(RuntimeValueKind.NUMBER, b, `expected b to be a number`);
      return RuntimeValueBuilders.number(op(a.value, b.value));
    }
  );
  return [name, fn];
}

function makeComparisonOperator(
  name: string,
  op: (a: any, b: any) => boolean
): [string, RuntimeFunctionValue] {
  const fn = RuntimeValueBuilders.function(
    name,
    (a: RuntimeValue, b: RuntimeValue) => {
      WrongTypeError.assertSameType(a, b);
      const valueA = RuntimeValues.jsPrimitiveFor(a);
      const valueB = RuntimeValues.jsPrimitiveFor(b);
      return RuntimeValueBuilders.bool(op(valueA, valueB));
    }
  );
  return [name, fn];
}

function makeBooleanOperator(
  name: string,
  op: (a: boolean, b: boolean) => boolean
): [string, RuntimeFunctionValue] {
  const fn = RuntimeValueBuilders.function(
    name,
    (a: RuntimeValue, b: RuntimeValue) => {
      WrongTypeError.assertIs(RuntimeValueKind.BOOL, a, `expected a to be a boolean`);
      WrongTypeError.assertIs(RuntimeValueKind.BOOL, b, `expected b to be a boolean`);
      return RuntimeValueBuilders.bool(op(a.value, b.value));
    }
  );
  return [name, fn];
}

export class WrongTypeError extends Error {
  constructor(message: string, readonly value: RuntimeValue) {
    super(message);
  }

  static assertIs<K extends RuntimeValueKind>(
    expectedKind: K,
    value: RuntimeValue,
    message: string
  ): asserts value is Extract<RuntimeValue, { kind: K }> {
    if (value.kind !== expectedKind) {
      throw new WrongTypeError(message, value);
    }
  }

  static assertSameType(valueA: RuntimeValue, valueB: RuntimeValue) {
    if (valueA.kind !== valueB.kind) {
      throw new WrongTypeError('mismatched types', valueA);
    }
  }
}
