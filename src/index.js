const lexer = require("./lexer");
const parser = require("./parse");
const run = require("./run");
const constants = require("./constants");

module.exports = function lisp(input, globals = constants.DEFAULT_GLOBALS) {
  return pipe(lexer, parser, ast => run(ast, globals))(input);
};

function pipe(...functions) {
  return initial => functions.reduce((value, nextFn) => nextFn(value), initial);
}
