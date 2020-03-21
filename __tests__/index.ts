import lisp from "../src";
import { Scope } from "../src/scope";

test("runs correctly", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  lisp(`(print (+ 1 1))`, scope);
  expect(print.mock.calls.length).toEqual(1);
  expect(print.mock.calls[0][0]).toEqual(2);
});

test("multi-statement programs", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  lisp(`(print "hello, ")\n(print "world")`, scope);
  expect(print.mock.calls.length).toBe(2);
  expect(print.mock.calls[0][0]).toEqual("hello, ");
  expect(print.mock.calls[1][0]).toEqual("world");
});

test("variable assignment", () => {
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  lisp(`(def x 1)\n(print x)`, scope);
  expect(print.mock.calls.length).toBe(1);
  expect(print.mock.calls[0][0]).toEqual(1);
});
