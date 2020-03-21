import lexer from "../src/lexer";
import { Tokens } from "../src/tokens";
import { ImmutableLocation } from "../src/reader";

const TokWithLoc = new Proxy(
  {},
  {
    get(_: any, prop: string) {
      if (prop in Tokens) {
        return (value: any) =>
          Tokens[prop](value, expect.any(ImmutableLocation));
      }
      throw new TypeError(`no builder with name ${prop}`);
    }
  }
);

test("transforms string into an array of tokens", () => {
  const input = `(+ 1 10)`;
  const output = [
    TokWithLoc.paren("("),
    TokWithLoc.operator("+"),
    TokWithLoc.number("1"),
    TokWithLoc.number("10"),
    TokWithLoc.paren(")")
  ];
  expect(lexer(input)).toEqual(output);
});

test("handles alphanumeric values", () => {
  const input = `(div 10 5)`;
  const output = [
    TokWithLoc.paren("("),
    TokWithLoc.identifier("div"),
    TokWithLoc.number("10"),
    TokWithLoc.number("5"),
    TokWithLoc.paren(")")
  ];
  expect(lexer(input)).toEqual(output);
});

test("handles strings (single quotes)", () => {
  const input = `(print 'hello, world')`;
  const output = [
    TokWithLoc.paren("("),
    TokWithLoc.identifier("print"),
    TokWithLoc.string("hello, world"),
    TokWithLoc.paren(")")
  ];
  expect(lexer(input)).toEqual(output);
});

test("handles strings (double quotes)", () => {
  const input = `(print "hello, world")`;
  const output = [
    TokWithLoc.paren("("),
    TokWithLoc.identifier("print"),
    TokWithLoc.string("hello, world"),
    TokWithLoc.paren(")")
  ];
  expect(lexer(input)).toEqual(output);
});

test("handles keywords", () => {
  let input = `(def x 1)`;
  let output = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("def"),
    TokWithLoc.identifier("x"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
  ];
  expect(lexer(input)).toEqual(output);

  input = `(fn foo [x y] 1)`;
  output = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.parameter("x"),
    TokWithLoc.parameter("y"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
  ];
  expect(lexer(input)).toEqual(output);

  input = `(fn foo [] 1)`;
  output = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
  ];
  expect(lexer(input)).toEqual(output);
});

describe("Token.location", () => {
  const loc = (offset: number, charInLine: number, line: number) =>
    new ImmutableLocation(offset, charInLine, line);

  test("simple source", () => {
    const input = `(x)`;
    const output = [
      Tokens.paren("(", loc(0, 0, 0)),
      Tokens.identifier("x", loc(1, 1, 0)),
      Tokens.paren(")", loc(2, 2, 0))
    ];
    expect(lexer(input)).toEqual(output);
  });

  test("newline", () => {
    expect(lexer("\n")).toEqual([Tokens.newline(loc(0, 0, 0))]);
  });

  test("newline before simple source", () => {
    expect(lexer("\n(x)")).toEqual([
      Tokens.newline(loc(0, 0, 0)),
      Tokens.paren("(", loc(1, 0, 1)),
      Tokens.identifier("x", loc(2, 1, 1)),
      Tokens.paren(")", loc(3, 2, 1))
    ]);
  });

  test("assignment", () => {
    const input = `(def x 1)`;
    const output = [
      Tokens.paren("(", loc(0, 0, 0)),
      Tokens.keyword("def", loc(1, 1, 0)),
      Tokens.identifier("x", loc(5, 5, 0)),
      Tokens.number("1", loc(7, 7, 0)),
      Tokens.paren(")", loc(8, 8, 0))
    ];
    expect(lexer(input)).toEqual(output);
  });

  test("function declaration", () => {
    const input = `(fn f [x] 1)`;
    const output = [
      Tokens.paren("(", loc(0, 0, 0)),
      Tokens.keyword("fn", loc(1, 1, 0)),
      Tokens.identifier("f", loc(4, 4, 0)),
      Tokens.parameter("x", loc(7, 7, 0)),
      Tokens.number("1", loc(10, 10, 0)),
      Tokens.paren(")", loc(11, 11, 0))
    ];
    expect(lexer(input)).toEqual(output);
  });

  test("function declaration with multiple arguments", () => {
    const input = `(fn f [x y] 1)`;
    const output = [
      Tokens.paren("(", loc(0, 0, 0)),
      Tokens.keyword("fn", loc(1, 1, 0)),
      Tokens.identifier("f", loc(4, 4, 0)),
      Tokens.parameter("x", loc(7, 7, 0)),
      Tokens.parameter("y", loc(9, 9, 0)),
      Tokens.number("1", loc(12, 12, 0)),
      Tokens.paren(")", loc(13, 13, 0))
    ];
    expect(lexer(input)).toEqual(output);
  });

  test("multiple lines", () => {
    const input = `(x)\n(y)\n(z)`;
    const output = [
      Tokens.paren("(", loc(0, 0, 0)),
      Tokens.identifier("x", loc(1, 1, 0)),
      Tokens.paren(")", loc(2, 2, 0)),

      Tokens.newline(loc(3, 3, 0)),

      Tokens.paren("(", loc(4, 0, 1)),
      Tokens.identifier("y", loc(5, 1, 1)),
      Tokens.paren(")", loc(6, 2, 1)),

      Tokens.newline(loc(7, 3, 1)),

      Tokens.paren("(", loc(8, 0, 2)),
      Tokens.identifier("z", loc(9, 1, 2)),
      Tokens.paren(")", loc(10, 2, 2))
    ];
    expect(lexer(input)).toEqual(output);
  });
});
