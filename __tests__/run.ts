import run from "../src/run";
import { ASTNode, ASTNodes } from "../src/parse";
import { Scope } from "../src/scope";

test("runs a full program", () => {
  const program = ASTNodes.program([
    ASTNodes.callExpression("print", [ASTNodes.stringLiteral("hello, world")])
  ]);
  const print = jest.fn();
  const scope = new Scope([["print", print]]);
  run(program, scope);
  expect(print.mock.calls.length).toEqual(1);
  expect(print.mock.calls[0][0]).toEqual("hello, world");
});

test("adds two numbers", () => {
  const program = ASTNodes.callExpression("+", [
    ASTNodes.numberLiteral("1"),
    ASTNodes.numberLiteral("1")
  ]);
  expect(run(program)).toEqual(2);
});

test("can assign variables", () => {
  const program = ASTNodes.program([
    ASTNodes.variableAssignment("x", ASTNodes.numberLiteral("1"))
  ]);
  const scope = new Scope();
  run(program, scope);
  // TODO(christianscott): remove any cast
  expect(scope.get("x")).toBe(1);
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
  const scope = Scope.prelude().with([["print", print]]);
  run(program, scope);
  expect(print.mock.calls.length).toEqual(1);
  expect(print.mock.calls[0][0]).toEqual(2);
});
