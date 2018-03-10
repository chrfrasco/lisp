const constants = require('./constants')

module.exports = function run(node, globals=constants.DEFAULT_GLOBALS) {
  switch (node.type) {
    case constants.PROGRAM:
      node.body.forEach(childNode => run(childNode, globals))
      break
    case constants.VARIABLE_ASSIGNMENT:
      globals[node.name] = run(node.value, globals)
      break
    case constants.CALL_EXPRESSION:
      return globals[node.name].apply(null, node.params.map(param => run(param, globals)))
    case constants.IDENTIFIER:
      if (globals[node.value]) {
        return globals[node.value]
      }
      break
    case constants.NUMBER_LITERAL:
      return parseInt(node.value, 10)
    case constants.STRING_LITERAL:
      return node.value
    default:
      throw new TypeError(`unrecognized node type ${node.type}`)
  }
}