const {
  NUMBER,
  STRING,
  PAREN,
  NUMBER_LITERAL,
  STRING_LITERAL,
  CALL_EXPRESSION,
  PROGRAM,
} = require('../src/constants')

module.exports = (tokens) => {
  let current = 0

  function walk() {
    let token = tokens[current]

    if (token.type === NUMBER) {
      current++
      return {
        type: NUMBER_LITERAL,
        value: token.value
      }
    }

    if (token.type === STRING) {
      current++
      return {
        type: STRING_LITERAL,
        value: token.value
      }
    }

    if (token.type === PAREN && token.value === '(') {
      token = tokens[++current]
      const node = {
        type: CALL_EXPRESSION,
        name: token.value,
        params: []
      }

      token = tokens[++current]
      while (
        (token.type !== PAREN) ||
        (token.type === PAREN && token.value !== ')')
      ) {
        node.params.push(walk())
        token = tokens[current]
      }

      current++

      return node
    }

    throw new TypeError(`unknown token of type ${token.type}: ${token.value}`)
  }

  const ast = {
    type: PROGRAM,
    body: [],
  }

  while (current < tokens.length) {
    ast.body.push(walk())
  }

  return ast
}
