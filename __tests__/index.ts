import lisp from "../src";
import { Scope } from "../src/scope";

test("runs correctly", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  lisp(`(print (+ 1 1))`, scope);
  expect(print).toHaveBeenCalledWith(2);
});

test("multi-statement programs", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  lisp(`(print "hello, ")\n(print "world")`, scope);

  expect(print).toHaveBeenCalledTimes(2);
  expect(print).toHaveBeenNthCalledWith(1, "hello, ");
  expect(print).toHaveBeenNthCalledWith(2, "world");
});

test("variable assignment", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  lisp(`(def x 1)\n(print x)`, scope);
  expect(print).toHaveBeenCalledWith(1);
});
