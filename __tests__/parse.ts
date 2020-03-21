import parse, { ASTNodes } from "../src/parse";
import { Tokens } from "../src/tokens";
import { ImmutableLocation } from "../src/reader";

const TokWithLoc = new Proxy({}, {
  get(_: any, prop: string) {
    if (prop in Tokens) {
      return (value: any) => Tokens[prop](value, expect.any(ImmutableLocation));
    }
    throw new TypeError(`no builder with name ${prop}`);
  },
})

test("handles empty list", () => {
  expect(parse([])).toEqual(ASTNodes.program([]));
});

test("operators", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.operator("+"),
    TokWithLoc.number("1"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
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
    TokWithLoc.paren("("),
    TokWithLoc.identifier("add"),
    TokWithLoc.number("1"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
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
    TokWithLoc.paren("("),
    TokWithLoc.identifier("print"),
    TokWithLoc.string("hello, world"),
    TokWithLoc.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.callExpression("print", [ASTNodes.stringLiteral("hello, world")])
  ]);
  expect(parse(input)).toEqual(output);
});

test("variable assignment", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("def"),
    TokWithLoc.identifier("x"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.variableAssignment("x", ASTNodes.numberLiteral("1"))
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with no arguments", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.functionDeclaration("foo", [], ASTNodes.numberLiteral("1"))
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with one argument", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.parameter("x"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.functionDeclaration("foo", ["x"], ASTNodes.numberLiteral("1"))
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with multiple arguments", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.parameter("x"),
    TokWithLoc.parameter("y"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
  ];
  const output = ASTNodes.program([
    ASTNodes.functionDeclaration("foo", ["x", "y"], ASTNodes.numberLiteral("1"))
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with complex body", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.parameter("x"),
    TokWithLoc.paren("("),
    TokWithLoc.identifier("print"),
    TokWithLoc.paren("("),
    TokWithLoc.operator("+"),
    TokWithLoc.number("1"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
    TokWithLoc.paren(")"),
    TokWithLoc.paren(")")
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
    TokWithLoc.paren("("),
    TokWithLoc.identifier("print"),
    TokWithLoc.paren("("),
    TokWithLoc.operator("+"),
    TokWithLoc.number("1"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
    TokWithLoc.paren(")")
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
