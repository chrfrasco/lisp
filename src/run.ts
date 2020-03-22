import {
  ASTNode,
  ASTNodeKind,
  FunctionDeclarationNode,
  CallExpressionNode,
  IdentifierNode
} from "./parse";
import { UnreachableError } from "./preconditions";
import {
  Scope,
  RuntimeValueKind,
  RuntimeValueBuilders,
  RuntimeValue,
  RuntimeFunctionValue,
  MismatchedTypesError
} from "./scope";
import { ErrorAtLocation } from "./error_at_location";

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

      if (fn == null) {
        throw new ReferenceError(node);
      }

      if (fn.kind !== RuntimeValueKind.FUNCTION) {
        throw new NotCallableError(fn, node);
      }

      try {
        return fn.value.apply(null, params);
      } catch (error) {
        if (error instanceof MismatchedTypesError) {
          throw new RuntimeTypeError(error.value, node);
        } else {
          throw error;
        }
      }
    }

    case ASTNodeKind.IDENTIFIER: {
      const value = scope.get(node.value);
      if (value == null) {
        throw new ReferenceError(node);
      }
      return value;
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

export class ReferenceError extends ErrorAtLocation {
  constructor(node: CallExpressionNode | IdentifierNode) {
    const identifier =
      node.type === ASTNodeKind.CALL_EXPRESSION ? node.name : node.value;
    super(`${identifier} is not defined`, node.location);
  }
}

export class NotCallableError extends ErrorAtLocation {
  constructor(value: RuntimeValue, callExpr: CallExpressionNode) {
    super(`value of type ${value.kind} is not callable`, callExpr.location);
  }
}

export class RuntimeTypeError extends ErrorAtLocation {
  constructor(value: RuntimeValue, callExpr: CallExpressionNode) {
    super(`unexpected value of type ${value.kind}`, callExpr.location);
  }
}

function makeFunction(
  { params, body, name }: FunctionDeclarationNode,
  parentScope: Scope
): RuntimeFunctionValue {
  return RuntimeValueBuilders.function(name, (...args: RuntimeValue[]) => {
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
