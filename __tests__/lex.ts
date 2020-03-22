import lex, { LexError } from "../src/lex";
import { TokenBuilders } from "../src/tokens";
import { ImmutableLocation } from "../src/reader";
import { createBuilderWithLocation } from "../src/test_helpers/create_builder_with_location";

const TokWithLoc = createBuilderWithLocation(TokenBuilders, expect.any(ImmutableLocation));

test("empty input", () => {
  expect(lex("")).toEqual([]);
});

test("transforms string into an array of tokens", () => {
  const input = `(+ 1 10)`;
  const output = [
    TokWithLoc.paren("("),
    TokWithLoc.operator("+"),
    TokWithLoc.number("1"),
    TokWithLoc.number("10"),
    TokWithLoc.paren(")")
  ];
  expect(lex(input)).toEqual(output);
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
  expect(lex(input)).toEqual(output);
});

test("handles strings (single quotes)", () => {
  const input = `(print 'hello, world')`;
  const output = [
    TokWithLoc.paren("("),
    TokWithLoc.identifier("print"),
    TokWithLoc.string("hello, world"),
    TokWithLoc.paren(")")
  ];
  expect(lex(input)).toEqual(output);
});

test("handles strings (double quotes)", () => {
  const input = `(print "hello, world")`;
  const output = [
    TokWithLoc.paren("("),
    TokWithLoc.identifier("print"),
    TokWithLoc.string("hello, world"),
    TokWithLoc.paren(")")
  ];
  expect(lex(input)).toEqual(output);
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
  expect(lex(input)).toEqual(output);

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
  expect(lex(input)).toEqual(output);

  input = `(fn foo [] 1)`;
  output = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
  ];
  expect(lex(input)).toEqual(output);
});

test.each(["((", "))"])("should reject %s due to unbalanced brackets", input => {
  expect(() => lex(input)).toThrow();
});

test.each([
  ["$", "$", [0, 0, 0]],
  ["^", "^", [0, 0, 0]],
  ["(def thing $)", "$", [11, 11, 0]]
] as [string, string, [number, number, number]][])(
  "should reject invalid char %s at location (%d, %d, %d)",
  (input, char, location) => {
    expect(() => lex(input)).toThrowError(
      new LexError(char, new ImmutableLocation(...location))
    );
  }
);

describe("Token.location", () => {
  const loc = (offset: number, charInLine: number, line: number) =>
    new ImmutableLocation(offset, charInLine, line);

  test("simple source", () => {
    const input = `(x)`;
    const output = [
      TokenBuilders.paren("(", loc(0, 0, 0)),
      TokenBuilders.identifier("x", loc(1, 1, 0)),
      TokenBuilders.paren(")", loc(2, 2, 0))
    ];
    expect(lex(input)).toEqual(output);
  });

  test("newline", () => {
    expect(lex("\n")).toEqual([TokenBuilders.newline(loc(0, 0, 0))]);
  });

  test("newline before simple source", () => {
    expect(lex("\n(x)")).toEqual([
      TokenBuilders.newline(loc(0, 0, 0)),
      TokenBuilders.paren("(", loc(1, 0, 1)),
      TokenBuilders.identifier("x", loc(2, 1, 1)),
      TokenBuilders.paren(")", loc(3, 2, 1))
    ]);
  });

  test("assignment", () => {
    const input = `(def x 1)`;
    const output = [
      TokenBuilders.paren("(", loc(0, 0, 0)),
      TokenBuilders.keyword("def", loc(1, 1, 0)),
      TokenBuilders.identifier("x", loc(5, 5, 0)),
      TokenBuilders.number("1", loc(7, 7, 0)),
      TokenBuilders.paren(")", loc(8, 8, 0))
    ];
    expect(lex(input)).toEqual(output);
  });

  test("function declaration", () => {
    const input = `(fn f [x] 1)`;
    const output = [
      TokenBuilders.paren("(", loc(0, 0, 0)),
      TokenBuilders.keyword("fn", loc(1, 1, 0)),
      TokenBuilders.identifier("f", loc(4, 4, 0)),
      TokenBuilders.parameter("x", loc(7, 7, 0)),
      TokenBuilders.number("1", loc(10, 10, 0)),
      TokenBuilders.paren(")", loc(11, 11, 0))
    ];
    expect(lex(input)).toEqual(output);
  });

  test("function declaration with multiple arguments", () => {
    const input = `(fn f [x y] 1)`;
    const output = [
      TokenBuilders.paren("(", loc(0, 0, 0)),
      TokenBuilders.keyword("fn", loc(1, 1, 0)),
      TokenBuilders.identifier("f", loc(4, 4, 0)),
      TokenBuilders.parameter("x", loc(7, 7, 0)),
      TokenBuilders.parameter("y", loc(9, 9, 0)),
      TokenBuilders.number("1", loc(12, 12, 0)),
      TokenBuilders.paren(")", loc(13, 13, 0))
    ];
    expect(lex(input)).toEqual(output);
  });

  test("multiple lines", () => {
    const input = `(x)\n(y)\n(z)`;
    const output = [
      TokenBuilders.paren("(", loc(0, 0, 0)),
      TokenBuilders.identifier("x", loc(1, 1, 0)),
      TokenBuilders.paren(")", loc(2, 2, 0)),

      TokenBuilders.newline(loc(3, 3, 0)),

      TokenBuilders.paren("(", loc(4, 0, 1)),
      TokenBuilders.identifier("y", loc(5, 1, 1)),
      TokenBuilders.paren(")", loc(6, 2, 1)),

      TokenBuilders.newline(loc(7, 3, 1)),

      TokenBuilders.paren("(", loc(8, 0, 2)),
      TokenBuilders.identifier("z", loc(9, 1, 2)),
      TokenBuilders.paren(")", loc(10, 2, 2))
    ];
    expect(lex(input)).toEqual(output);
  });
});
