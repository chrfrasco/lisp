import run from "../src/run";
import { ASTNode, ASTNodes } from "../src/parse";
import { Scope, RuntimeValueBuilders } from "../src/scope";
import { ImmutableLocation } from "../src/reader";

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
