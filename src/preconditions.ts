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
}

export class UnreachableError extends Error {
  /** @param x an unreachable value */
  constructor(x: never) {
    super(`unhandled case: ${JSON.stringify(x)}`);
  }
}
