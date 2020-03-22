import run, { ReferenceError, NotCallableError, RuntimeTypeError } from "../run";
import { ASTNode, ASTNodeBuilders } from "../parse";
import { Scope, RuntimeValueBuilders } from "../scope";
import { ImmutableLocation } from "../reader";
import { createBuilderWithLocation } from "./create_builder_with_location";

const ASTNodesWithLoc = createBuilderWithLocation(
  ASTNodeBuilders,
  expect.any(ImmutableLocation)
);

test("runs a full program", () => {
  const program = ASTNodesWithLoc.program([
    ASTNodesWithLoc.callExpression("print", [
      ASTNodesWithLoc.stringLiteral("hello, world")
    ])
  ]);
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  run(program, scope);
  expect(print).toHaveBeenCalledWith("hello, world");
});

test("adds two numbers", () => {
  const program = ASTNodesWithLoc.callExpression("+", [
    ASTNodesWithLoc.numberLiteral("1"),
    ASTNodesWithLoc.numberLiteral("1")
  ]);
  expect(run(program)).toEqual(RuntimeValueBuilders.number(2));
});

test("can assign variables", () => {
  const program = ASTNodesWithLoc.program([
    ASTNodesWithLoc.variableAssignment("x", ASTNodesWithLoc.numberLiteral("1"))
  ]);
  const scope = new Scope();
  run(program, scope);
  expect(scope.get("x")).toEqual(RuntimeValueBuilders.number(1));
});

test("function declaration", () => {
  const program: ASTNode = ASTNodesWithLoc.program([
    ASTNodesWithLoc.functionDeclaration(
      "add",
      ["x", "y"],
      ASTNodesWithLoc.callExpression("+", [
        ASTNodesWithLoc.identifier("x"),
        ASTNodesWithLoc.identifier("y")
      ])
    ),
    ASTNodesWithLoc.callExpression("print", [
      ASTNodesWithLoc.callExpression("add", [
        ASTNodesWithLoc.numberLiteral("1"),
        ASTNodesWithLoc.numberLiteral("1")
      ])
    ])
  ]);
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  run(program, scope);
  expect(print).toHaveBeenCalledWith(2);
});

test('throws when trying to call an undefined symbol', () => {
  const callExpr = 
    ASTNodeBuilders.callExpression('x', [], new ImmutableLocation(10, 0, 1));
  const program = ASTNodesWithLoc.program([callExpr]);
  expect(() => run(program)).toThrow(new ReferenceError(callExpr));
});

test('throws when trying to use an undefined symbol', () => {
  const x = ASTNodeBuilders.identifier('x', new ImmutableLocation(0, 0, 0));
  const program = ASTNodesWithLoc.program([x]);
  expect(() => run(program)).toThrow(new ReferenceError(x));
});

test('throws when trying to call something that is not callable', () => {
  const callExpr = 
    ASTNodeBuilders.callExpression('x', [], new ImmutableLocation(10, 0, 1));
  const program = ASTNodesWithLoc.program([
    ASTNodesWithLoc.variableAssignment('x', ASTNodesWithLoc.stringLiteral('hello')),
    callExpr,
  ]);
  const stringValue = RuntimeValueBuilders.string('hello');
  expect(() => run(program)).toThrow(new NotCallableError(stringValue, callExpr));
});

test('throws when there is a type mismatch at runtime', () => {
  const callExpr = 
    ASTNodeBuilders.callExpression('concat', [
      ASTNodesWithLoc.numberLiteral('1')
    ], new ImmutableLocation(10, 0, 1));
  const program = ASTNodesWithLoc.program([callExpr]);
  const numberValue = RuntimeValueBuilders.number(1);
  expect(() => run(program)).toThrow(new RuntimeTypeError(numberValue, callExpr));
});
