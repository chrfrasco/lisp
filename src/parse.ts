const {
  NUMBER,
  STRING,
  PAREN,
  KEYWORD,
  IDENTIFIER,
  NUMBER_LITERAL,
  STRING_LITERAL,
  CALL_EXPRESSION,
  VARIABLE_ASSIGNMENT,
  PROGRAM,
  KEYWORDS,
  PARAMETER,
  FUNCTION_DECLARATION
} = require("../src/constants");

module.exports = tokens => {
  let current = 0;

  function walk() {
    let token = tokens[current];

    if (token.type === NUMBER) {
      current++;
      return {
        type: NUMBER_LITERAL,
        value: token.value
      };
    }

    if (token.type === STRING) {
      current++;
      return {
        type: STRING_LITERAL,
        value: token.value
      };
    }

    if (token.type === PAREN && token.value === "(") {
      token = tokens[++current];

      let node;
      if (token.type === KEYWORD) {
        const keywordType = KEYWORDS[token.value];
        if (keywordType === VARIABLE_ASSIGNMENT) {
          node = handleVariableAssignment();
        }

        if (keywordType === FUNCTION_DECLARATION) {
          node = handleFunctionDeclaration();
        }
      } else {
        node = handleCallExpression();
      }

      return node;
    }

    if (token.type === IDENTIFIER) {
      current++;
      return {
        type: IDENTIFIER,
        value: token.value
      };
    }

    throw new TypeError(
      `unhandled token of type ${token.type}: ${token.value}`
    );
  }

  /**
   * @returns {{name: string, type: string, value: {type, value}}}
   */
  function handleVariableAssignment() {
    let token = tokens[++current];
    assert(
      token.type === IDENTIFIER,
      `expected IDENTIFIER, got ${token.type}: ${token.value}`
    );
    const name = token.value;
    current++;
    const node = {
      name,
      type: VARIABLE_ASSIGNMENT,
      value: walk()
    };
    current++;
    return node;
  }

  function handleFunctionDeclaration() {
    let token = tokens[++current];

    assert(token.type === IDENTIFIER, "expected a name");
    const name = token.value;

    let params = [];
    token = tokens[++current];
    while (token.type === PARAMETER) {
      params.push(token.value);
      token = tokens[++current];
    }

    const node = {
      type: FUNCTION_DECLARATION,
      name,
      params,
      body: walk()
    };

    current++;
    return node;
  }

  /**
   * @returns {{type: string, name: string, params: Array}}
   */
  function handleCallExpression() {
    let token = tokens[current];
    const node = {
      type: CALL_EXPRESSION,
      name: token.value,
      params: []
    };

    token = tokens[++current];
    while (
      token.type !== PAREN ||
      (token.type === PAREN && token.value !== ")")
    ) {
      node.params.push(walk());
      token = tokens[current];
    }

    current++;
    return node;
  }

  const ast = {
    type: PROGRAM,
    body: []
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
};

function assert(assertion, message, errConstructor = TypeError) {
  if (!assertion) {
    throw new errConstructor(message);
  }
}
