import {
  ASTNode,
  ASTNodeKind,
  FunctionNode as FunctionDeclarationNode
} from "./parse";
import { UnreachableError } from "./preconditions";
import {
  Scope,
  RuntimeValueKind,
  RuntimeValueBuilders,
  RuntimeValue,
  RuntimeFunctionValue
} from "./scope";

export default function run(
  node: ASTNode,
  scope = Scope.prelude()
): RuntimeValue {
  switch (node.type) {
    case ASTNodeKind.PROGRAM: {
      const result = node.body.map(childNode => run(childNode, scope));
      return result[result.length - 1];
    }

    case ASTNodeKind.FUNCTION_DECLARATION: {
      const fn = makeFunction(node, scope);
      scope.assign(node.name, fn);
      return fn;
    }

    case ASTNodeKind.VARIABLE_ASSIGNMENT: {
      scope.assign(node.name, run(node.value, scope));
      return RuntimeValueBuilders.nil();
    }

    case ASTNodeKind.CALL_EXPRESSION: {
      const params = node.params.map(param => run(param, scope));
      const fn = scope.get(node.name);

      if (fn.kind !== RuntimeValueKind.FUNCTION) {
        throw new TypeError(`value of type ${fn.kind} is not callable`);
      }

      return fn.value.apply(null, params);
    }

    case ASTNodeKind.IDENTIFIER: {
      return scope.get(node.value);
    }

    case ASTNodeKind.NUMBER_LITERAL: {
      return RuntimeValueBuilders.number(parseInt(node.value, 10));
    }

    case ASTNodeKind.STRING_LITERAL: {
      return RuntimeValueBuilders.string(node.value);
    }

    default:
      throw new UnreachableError(node);
  }
}

function makeFunction(
  { params, body }: FunctionDeclarationNode,
  parentScope: Scope
): RuntimeFunctionValue {
  return RuntimeValueBuilders.function((...args: RuntimeValue[]) => {
    const scope = parentScope.with(zip(params, args));
    return run(body, scope);
  });
}

function zip<X, Y>(xs: readonly X[], ys: readonly Y[]): [X, Y][] {
  const zipped: [X, Y][] = [];
  for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
    zipped.push([xs[i], ys[i]]);
  }
  return zipped;
}
