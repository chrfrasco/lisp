const constants = require('./constants')

module.exports = run

function run(node, globals=constants.DEFAULT_GLOBALS) {
  switch (node.type) {
    case constants.PROGRAM:
      const result = node.body.map(childNode => run(childNode, globals))
      if (result.length === 1) {
        return result[0]
      } else {
        return result
      }
    case constants.FUNCTION_DECLARATION:
      const fn = makeFunction(node, globals)
      globals[node.name] = fn
      return fn
    case constants.VARIABLE_ASSIGNMENT:
      globals[node.name] = run(node.value, globals)
      break
    case constants.CALL_EXPRESSION:
      const params = node.params.map(param => run(param, globals))
      return globals[node.name].apply(null, params)
    case constants.IDENTIFIER:
      if (globals[node.value]) {
        return globals[node.value]
      } else {
        throw new TypeError(`${node.value} is not defined`)
      }
    case constants.NUMBER_LITERAL:
      return parseInt(node.value, 10)
    case constants.STRING_LITERAL:
      return node.value
    default:
      throw new TypeError(`unrecognized node type ${node.type}`)
  }
}

function makeFunction({ params, body }, globals) {
  return (...args) => {
    const scope = {}
    for (let i = 0; i < params.length; i++) {
      scope[params[i]] = args[i]
    }
    return run(body, Object.assign({}, globals, scope))
  }
}
