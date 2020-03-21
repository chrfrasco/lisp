import run from "../src/run";
import { ASTNode, ASTNodes } from "../src/parse";
import { Scope, RuntimeValueBuilders } from "../src/scope";

test("runs a full program", () => {
  const program = ASTNodes.program([
    ASTNodes.callExpression("print", [ASTNodes.stringLiteral("hello, world")])
  ]);
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  run(program, scope);
  expect(print).toHaveBeenCalledWith("hello, world");
});

test("adds two numbers", () => {
  const program = ASTNodes.callExpression("+", [
    ASTNodes.numberLiteral("1"),
    ASTNodes.numberLiteral("1")
  ]);
  expect(run(program)).toEqual(RuntimeValueBuilders.number(2));
});

test("can assign variables", () => {
  const program = ASTNodes.program([
    ASTNodes.variableAssignment("x", ASTNodes.numberLiteral("1"))
  ]);
  const scope = new Scope();
  run(program, scope);
  expect(scope.get("x")).toEqual(RuntimeValueBuilders.number(1));
});

test("function declaration", () => {
  const program: ASTNode = ASTNodes.program([
    ASTNodes.functionDeclaration(
      "add",
      ["x", "y"],
      ASTNodes.callExpression("+", [
        ASTNodes.identifier("x"),
        ASTNodes.identifier("y")
      ])
    ),
    ASTNodes.callExpression("print", [
      ASTNodes.callExpression("add", [
        ASTNodes.numberLiteral("1"),
        ASTNodes.numberLiteral("1")
      ])
    ])
  ]);
  const print = jest.fn();
  const scope = Scope.forTesting(print);
  run(program, scope);
  expect(print).toHaveBeenCalledWith(2);
});
