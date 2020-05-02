import parse, { ASTNodeBuilders, ParseError } from "../parse";
import { TokenBuilders } from "../tokens";
import { ImmutableLocation } from "../reader";
import { createBuilderWithLocation } from "./create_builder_with_location";

const TokWithLoc = createBuilderWithLocation(
  TokenBuilders,
  expect.any(ImmutableLocation)
);

const ASTNodesWithLoc = createBuilderWithLocation(
  ASTNodeBuilders,
  expect.any(ImmutableLocation)
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
    TokWithLoc.paren(")"),
  ];
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.callExpression("+", [
      ASTNodesWithLoc.numberLiteral("1"),
      ASTNodesWithLoc.numberLiteral("1"),
    ]),
  ]);
  expect(parse(input)).toEqual(output);
});

test("identifiers", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.identifier("add"),
    TokWithLoc.number("1"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
  ];
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.callExpression("add", [
      ASTNodesWithLoc.numberLiteral("1"),
      ASTNodesWithLoc.numberLiteral("1"),
    ]),
  ]);
  expect(parse(input)).toEqual(output);
});

test("string literals", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.identifier("print"),
    TokWithLoc.string("hello, world"),
    TokWithLoc.paren(")"),
  ];
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.callExpression("print", [
      ASTNodesWithLoc.stringLiteral("hello, world"),
    ]),
  ]);
  expect(parse(input)).toEqual(output);
});

test("variable assignment", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("def"),
    TokWithLoc.identifier("x"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
  ];
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.variableAssignment("x", ASTNodesWithLoc.numberLiteral("1")),
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with no arguments", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.paren("["),
    TokWithLoc.paren("]"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
  ];
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.functionDeclaration(
      "foo",
      [],
      ASTNodesWithLoc.numberLiteral("1")
    ),
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with one argument", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.paren("["),
    TokWithLoc.identifier("x"),
    TokWithLoc.paren("]"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
  ];
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.functionDeclaration(
      "foo",
      ["x"],
      ASTNodesWithLoc.numberLiteral("1")
    ),
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with multiple arguments", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.paren("["),
    TokWithLoc.identifier("x"),
    TokWithLoc.identifier("y"),
    TokWithLoc.paren("]"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
  ];
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.functionDeclaration(
      "foo",
      ["x", "y"],
      ASTNodesWithLoc.numberLiteral("1")
    ),
  ]);
  expect(parse(input)).toEqual(output);
});

test("function declaration with complex body", () => {
  const input = [
    TokWithLoc.paren("("),
    TokWithLoc.keyword("fn"),
    TokWithLoc.identifier("foo"),
    TokWithLoc.paren("["),
    TokWithLoc.identifier("x"),
    TokWithLoc.paren("]"),
    TokWithLoc.paren("("),
    TokWithLoc.identifier("print"),
    TokWithLoc.paren("("),
    TokWithLoc.operator("+"),
    TokWithLoc.number("1"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
    TokWithLoc.paren(")"),
    TokWithLoc.paren(")"),
  ];
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.functionDeclaration(
      "foo",
      ["x"],
      ASTNodesWithLoc.callExpression("print", [
        ASTNodesWithLoc.callExpression("+", [
          ASTNodesWithLoc.numberLiteral("1"),
          ASTNodesWithLoc.numberLiteral("1"),
        ]),
      ])
    ),
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
    TokWithLoc.paren(")"),
  ];
  const output = ASTNodesWithLoc.program([
    ASTNodesWithLoc.callExpression("print", [
      ASTNodesWithLoc.callExpression("+", [
        ASTNodesWithLoc.numberLiteral("1"),
        ASTNodesWithLoc.numberLiteral("1"),
      ]),
    ]),
  ]);
  expect(parse(input)).toEqual(output);
});

test("rejects keywords being used as identifiers", () => {
  let input = [
    TokWithLoc.paren("("),
    TokWithLoc.identifier("def"),
    TokWithLoc.keyword("def"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
  ];
  let err = new ParseError(
    TokenBuilders.keyword("def", new ImmutableLocation(5, 5, 0))
  );
  expect(() => parse(input)).toThrowError(err);

  input = [
    TokWithLoc.paren("("),
    TokWithLoc.identifier("def"),
    TokWithLoc.keyword("fn"),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
  ];
  err = new ParseError(
    TokenBuilders.keyword("fn", new ImmutableLocation(5, 5, 0))
  );
  expect(() => parse(input)).toThrowError(err);
});

test("rejects call expressions not using identifiers or operators", () => {
  let input = [
    TokWithLoc.paren("("),
    TokWithLoc.string("x"),
    TokWithLoc.paren(")"),
  ];
  let err = new ParseError(
    TokenBuilders.string("def", new ImmutableLocation(1, 1, 0))
  );
  expect(() => parse(input)).toThrowError(err);

  input = [
    TokWithLoc.paren("("),
    TokWithLoc.number("1"),
    TokWithLoc.paren(")"),
  ];
  err = new ParseError(
    TokenBuilders.number(1, new ImmutableLocation(1, 1, 0))
  );
  expect(() => parse(input)).toThrowError(err);
});
