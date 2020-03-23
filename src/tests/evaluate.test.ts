import { evaluate } from "../evaluate";
import { Scope, RuntimeValueBuilders } from "../scope";

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

describe("Scope.prelude", () => {
  test("nil", () => {
    expect(evaluate(`nil`)).toEqual(RuntimeValueBuilders.nil());
  });

  test("true", () => {
    expect(evaluate(`true`)).toEqual(RuntimeValueBuilders.bool(true));
  });

  test("false", () => {
    expect(evaluate(`false`)).toEqual(RuntimeValueBuilders.bool(false));
  });

  test("concat", () => {
    expect(evaluate(`(concat "hello" ", " "world" "!")`)).toEqual(
      RuntimeValueBuilders.string("hello, world!")
    );
  });

  describe("numeric operators", () => {
    test("+", () => {
      expect(evaluate(`(+ 1 1)`)).toEqual(RuntimeValueBuilders.number(2));
    });

    test("-", () => {
      expect(evaluate(`(- 1 1)`)).toEqual(RuntimeValueBuilders.number(0));
    });

    test("*", () => {
      expect(evaluate(`(* 10 10)`)).toEqual(RuntimeValueBuilders.number(100));
    });

    test("/", () => {
      expect(evaluate(`(/ 10 10)`)).toEqual(RuntimeValueBuilders.number(1));
    });

    test("pow", () => {
      expect(evaluate(`(pow 10 2)`)).toEqual(RuntimeValueBuilders.number(100));
    });
  });

  describe("comparison operators", () => {
    test(">", () => {
      expect(evaluate("(> 1 0)")).toEqual(RuntimeValueBuilders.bool(true));
    });

    test("<", () => {
      expect(evaluate("(< 1 0)")).toEqual(RuntimeValueBuilders.bool(false));
    });

    test(">=", () => {
      expect(evaluate("(>= 1 0)")).toEqual(RuntimeValueBuilders.bool(true));
    });

    test("<=", () => {
      expect(evaluate("(<= 1 0)")).toEqual(RuntimeValueBuilders.bool(false));
    });

    test("=", () => {
      expect(evaluate("(= 1 0)")).toEqual(RuntimeValueBuilders.bool(false));
    });

    test("!=", () => {
      expect(evaluate("(!= 1 0)")).toEqual(RuntimeValueBuilders.bool(true));
    });
  });
});
