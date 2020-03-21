import lexer, { Tokens } from "../src/lexer";

test("transforms string into an array of tokens", () => {
  const input = `(+ 1 10)`;
  const output = [
    Tokens.paren("("),
    Tokens.operator("+"),
    Tokens.number("1"),
    Tokens.number("10"),
    Tokens.paren(")")
  ];
  expect(lexer(input)).toEqual(output);
});

test("handles alphanumeric values", () => {
  const input = `(div 10 5)`;
  const output = [
    Tokens.paren("("),
    Tokens.identifier("div"),
    Tokens.number("10"),
    Tokens.number("5"),
    Tokens.paren(")")
  ];
  expect(lexer(input)).toEqual(output);
});

test("handles strings (single quotes)", () => {
  const input = `(print 'hello, world')`;
  const output = [
    Tokens.paren("("),
    Tokens.identifier("print"),
    Tokens.string("hello, world"),
    Tokens.paren(")")
  ];
  expect(lexer(input)).toEqual(output);
});

test("handles strings (double quotes)", () => {
  const input = `(print "hello, world")`;
  const output = [
    Tokens.paren("("),
    Tokens.identifier("print"),
    Tokens.string("hello, world"),
    Tokens.paren(")")
  ];
  expect(lexer(input)).toEqual(output);
});

test("handles keywords", () => {
  let input = `(def x 1)`;
  let output = [
    Tokens.paren("("),
    Tokens.keyword("def"),
    Tokens.identifier("x"),
    Tokens.number("1"),
    Tokens.paren(")")
  ];
  expect(lexer(input)).toEqual(output);

  input = `(fn foo [x y] 1)`;
  output = [
    Tokens.paren("("),
    Tokens.keyword("fn"),
    Tokens.identifier("foo"),
    Tokens.parameter("x"),
    Tokens.parameter("y"),
    Tokens.number("1"),
    Tokens.paren(")")
  ];
  expect(lexer(input)).toEqual(output);

  input = `(fn foo [] 1)`;
  output = [
    Tokens.paren("("),
    Tokens.keyword("fn"),
    Tokens.identifier("foo"),
    Tokens.number("1"),
    Tokens.paren(")")
  ];
  expect(lexer(input)).toEqual(output);
});
