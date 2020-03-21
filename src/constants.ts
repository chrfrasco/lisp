export const DEFAULT_GLOBALS: { [key: string]: any } = {
  print: console.log.bind(console),
  "+": (a: number, b: number) => a + b,
  "*": (a: number, b: number) => a * b,
  "-": (a: number, b: number) => a - b,
  "/": (a: number, b: number) => a / b,
  pow: (a: number, b: number) => a ** b
};
