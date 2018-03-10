const lexer = require('./src/lexer')
const parser = require('./src/parse')
const run = require('./src/run')
const constants = require('./src/constants')

module.exports = function lisp(input, globals=constants.DEFAULT_GLOBALS) {
  return pipe(
    lexer,
    parser,
    ast => run(ast, globals)
  )(input)
}

function pipe(...functions) {
  return (initial) => functions.reduce((value, nextFn) => nextFn(value), initial)
}
