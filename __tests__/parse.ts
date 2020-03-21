import parse, { ASTNodes, ASTNode } from "../src/parse";
import { Tokens } from "../src/tokens";
import { ImmutableLocation } from "../src/reader";

// DUPLICATE(#1)
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

// DUPLICATE(#2)
const ASTNodesWithLoc = new Proxy(
  {},
  {
    get(_: any, prop: string): (...args: any[]) => ASTNode {
      if (prop in ASTNodes) {
        return (...args: any[]) =>
          ASTNodes[prop](...args, expect.any(ImmutableLocation));
      }
      throw new TypeError(`no builder with name ${prop}`);
    }
  }
);

test("handles empty list", () => {
  expect(parse([])).toEqual(ASTNodesWithLoc.program([]));
});

test("operators", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.operator("+"),
    TokWithLoc.number("1"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")")
  ];
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.callExpression("+", [
      ASTNodesWithLoc.numberLiteral("1"),
      ASTNodesWithLoc.numberLiteral("1")
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
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.callExpression("add", [
      ASTNodesWithLoc.numberLiteral("1"),
      ASTNodesWithLoc.numberLiteral("1")
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
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.callExpression("print", [
      ASTNodesWithLoc.stringLiteral("hello, world")
    ])
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
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.variableAssignment("x", ASTNodesWithLoc.numberLiteral("1"))
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
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.functionDeclaration(
      "foo",
      [],
      ASTNodesWithLoc.numberLiteral("1")
    )
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
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.functionDeclaration(
      "foo",
      ["x"],
      ASTNodesWithLoc.numberLiteral("1")
    )
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
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.functionDeclaration(
      "foo",
      ["x", "y"],
      ASTNodesWithLoc.numberLiteral("1")
    )
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
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.functionDeclaration(
      "foo",
      ["x"],
      ASTNodesWithLoc.callExpression("print", [
        ASTNodesWithLoc.callExpression("+", [
          ASTNodesWithLoc.numberLiteral("1"),
          ASTNodesWithLoc.numberLiteral("1")
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
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.callExpression("print", [
      ASTNodesWithLoc.callExpression("+", [
        ASTNodesWithLoc.numberLiteral("1"),
        ASTNodesWithLoc.numberLiteral("1")
      ])
    ])
  ]);
  expect(parse(input)).toEqual(output);
});
