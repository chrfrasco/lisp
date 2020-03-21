import { evaluate } from "../src/evaluate";
import { Scope } from "../src/scope";

test("runs correctly", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  evaluate(`(print (+ 1 1))`, scope);
  expect(print).toHaveBeenCalledWith(2);
});

test("multi-statement programs", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  evaluate(`(print "hello, ")\n(print "world")`, scope);

  expect(print).toHaveBeenCalledTimes(2);
  expect(print).toHaveBeenNthCalledWith(1, "hello, ");
  expect(print).toHaveBeenNthCalledWith(2, "world");
});

test("variable assignment", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  evaluate(`(def x 1)\n(print x)`, scope);
  expect(print).toHaveBeenCalledWith(1);
});

test("function calls with no arguments", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  evaluate(`(fn x [] 1)\n(print (x))`, scope);
  expect(print).toHaveBeenCalledWith(1);
});

test("function calls with arguments", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  evaluate(
    `(fn greet [name] (concat "hello " name))\n(print (greet "christian"))`,
    scope
  );
  expect(print).toHaveBeenCalledWith("hello christian");
});
