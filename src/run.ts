import {
  ASTNode,
  ASTNodeKind,
  FunctionNode as FunctionDeclarationNode
} from "./parse";
import { UnreachableError } from "./preconditions";
import { Scope } from "./scope";

export default function run(node: ASTNode, scope = Scope.prelude()): any {
  switch (node.type) {
    case ASTNodeKind.PROGRAM:
      const result = node.body.map(childNode => run(childNode, scope));
      if (result.length === 1) {
        return result[0];
      } else {
        return result;
      }
    case ASTNodeKind.FUNCTION_DECLARATION:
      const fn = makeFunction(node, scope);
      scope.assign(node.name, fn);
      return fn;
    case ASTNodeKind.VARIABLE_ASSIGNMENT:
      scope.assign(node.name, run(node.value, scope));
      break;
    case ASTNodeKind.CALL_EXPRESSION:
      const params = node.params.map(param => run(param, scope));
      return scope.get(node.name).apply(null, params);
    case ASTNodeKind.IDENTIFIER:
      if (scope.includes(node.value)) {
        return scope.get(node.value);
      } else {
        throw new TypeError(`${node.value} is not defined`);
      }
    case ASTNodeKind.NUMBER_LITERAL:
      return parseInt(node.value, 10);
    case ASTNodeKind.STRING_LITERAL:
      return node.value;
    default:
      throw new UnreachableError(node);
  }
}

function makeFunction(
  { params, body }: FunctionDeclarationNode,
  parentScope: Scope
) {
  return (...args: any[]) => {
    const scope = parentScope.with(zip(params, args));
    return run(body, scope);
  };
}

function zip<X, Y>(xs: readonly X[], ys: readonly Y[]): [X, Y][] {
  const zipped: [X, Y][] = [];
  for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
    zipped.push([xs[i], ys[i]]);
  }
  return zipped;
}
