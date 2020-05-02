export class Preconditions {
  static checkState(
    cond: boolean,
    message: string,
    errConstructor = TypeError
  ): asserts cond {
    if (!cond) {
      throw new errConstructor(message);
    }
  }
  static checkExists(x: null | undefined, msg?: string, ...args: any[]): never;
  static checkExists<T>(
    x: T | null | undefined,
    msg?: string,
    ...args: any[]
  ): T;
  static checkExists<T>(
    x: T | null | undefined,
    msg?: string,
    ...args: any[]
  ): T {
    if (x == null) {
      throw new Error(
        msg == null ? "argument is null" : Preconditions.format(msg, ...args)
      );
    }
    return x;
  }

  private static format(template: string, ...args: any[]): string {
    let i = 0;
    return template.replace(/\{}/g, () => (i < args.length ? args[i++] : "{}"));
  }
}

export class UnreachableError extends Error {
  /** @param x an unreachable value */
  constructor(x: never) {
    super(`unhandled case: ${JSON.stringify(x)}`);
  }
}
