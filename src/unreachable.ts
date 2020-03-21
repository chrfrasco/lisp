export class UnreachableError extends Error {
  /** @param x an unreachable value */
  constructor(x: never) {
    super(`unhandled case: ${JSON.stringify(x)}`);
  }
}
