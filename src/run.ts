import { DEFAULT_GLOBALS } from "./constants";
import {
  ASTNode,
  ASTNodeKind,
  FunctionNode as FunctionDeclarationNode
} from "./parse";
import { UnreachableError } from "./preconditions";

export default function run(node: ASTNode, globals = DEFAULT_GLOBALS): any {
  switch (node.type) {
    case ASTNodeKind.PROGRAM:
      const result = node.body.map(childNode => run(childNode, globals));
      if (result.length === 1) {
        return result[0];
      } else {
        return result;
      }
    case ASTNodeKind.FUNCTION_DECLARATION:
      const fn = makeFunction(node, globals);
      globals[node.name] = fn;
      return fn;
    case ASTNodeKind.VARIABLE_ASSIGNMENT:
      globals[node.name] = run(node.value, globals);
      break;
    case ASTNodeKind.CALL_EXPRESSION:
      const params = node.params.map(param => run(param, globals));
      return globals[node.name].apply(null, params);
    case ASTNodeKind.IDENTIFIER:
      if (globals[node.value]) {
        return globals[node.value];
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

function makeFunction({ params, body }: FunctionDeclarationNode, globals: any) {
  return (...args: any[]) => {
    const scope: { [key: string]: any } = {};
    for (let i = 0; i < params.length; i++) {
      scope[params[i]] = args[i];
    }
    return run(body, Object.assign({}, globals, scope));
  };
}
