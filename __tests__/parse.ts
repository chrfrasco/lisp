import parse, { ASTNodes } from "../src/parse";
import { Tokens } from "../src/lexer";

test("handles empty list", () => {
  expect(parse([])).toEqual(ASTNodes.program([]));
});

test("operators", () => {
  const input = [
    Tokens.paren("("),
    Tokens.operator("+"),
    Tokens.number("1"),
    Tokens.number("1"),
    Tokens.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.callExpression("+", [
      ASTNodes.numberLiteral("1"),
      ASTNodes.numberLiteral("1")
    ])
  ]);
  expect(parse(input)).toEqual(output);
});

test("identifiers", () => {
  const input = [
    Tokens.paren("("),
    Tokens.identifier("add"),
    Tokens.number("1"),
    Tokens.number("1"),
    Tokens.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.callExpression("add", [
      ASTNodes.numberLiteral("1"),
      ASTNodes.numberLiteral("1")
    ])
  ]);
  expect(parse(input)).toEqual(output);
});

test("string literals", () => {
  const input = [
    Tokens.paren("("),
    Tokens.identifier("print"),
    Tokens.string("hello, world"),
    Tokens.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.callExpression("print", [ASTNodes.stringLiteral("hello, world")])
  ]);
  expect(parse(input)).toEqual(output);
});

test("variable assignment", () => {
  const input = [
    Tokens.paren("("),
    Tokens.keyword("def"),
    Tokens.identifier("x"),
    Tokens.number("1"),
    Tokens.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.variableAssignment("x", ASTNodes.numberLiteral("1"))
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with no arguments", () => {
  const input = [
    Tokens.paren("("),
    Tokens.keyword("fn"),
    Tokens.identifier("foo"),
    Tokens.number("1"),
    Tokens.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.functionDeclaration("foo", [], ASTNodes.numberLiteral("1"))
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with one argument", () => {
  const input = [
    Tokens.paren("("),
    Tokens.keyword("fn"),
    Tokens.identifier("foo"),
    Tokens.parameter("x"),
    Tokens.number("1"),
    Tokens.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.functionDeclaration("foo", ["x"], ASTNodes.numberLiteral("1"))
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with multiple arguments", () => {
  const input = [
    Tokens.paren("("),
    Tokens.keyword("fn"),
    Tokens.identifier("foo"),
    Tokens.parameter("x"),
    Tokens.parameter("y"),
    Tokens.number("1"),
    Tokens.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.functionDeclaration("foo", ["x", "y"], ASTNodes.numberLiteral("1"))
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with complex body", () => {
  const input = [
    Tokens.paren("("),
    Tokens.keyword("fn"),
    Tokens.identifier("foo"),
    Tokens.parameter("x"),
    Tokens.paren("("),
    Tokens.identifier("print"),
    Tokens.paren("("),
    Tokens.operator("+"),
    Tokens.number("1"),
    Tokens.number("1"),
    Tokens.paren(")"),
    Tokens.paren(")"),
    Tokens.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.functionDeclaration(
      "foo",
      ["x"],
      ASTNodes.callExpression("print", [
        ASTNodes.callExpression("+", [
          ASTNodes.numberLiteral("1"),
          ASTNodes.numberLiteral("1")
        ])
      ])
    )
  ]);
  expect(parse(input)).toEqual(output);
});

test("nested call expressions", () => {
  const input = [
    Tokens.paren("("),
    Tokens.identifier("print"),
    Tokens.paren("("),
    Tokens.operator("+"),
    Tokens.number("1"),
    Tokens.number("1"),
    Tokens.paren(")"),
    Tokens.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.callExpression("print", [
      ASTNodes.callExpression("+", [
        ASTNodes.numberLiteral("1"),
        ASTNodes.numberLiteral("1")
      ])
    ])
  ]);
  expect(parse(input)).toEqual(output);
});
