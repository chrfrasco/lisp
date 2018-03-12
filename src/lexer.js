const {
  NUMBER,
  STRING,
  PAREN,
  OPERATOR,
  IDENTIFIER,
  KEYWORD,
  KEYWORDS,
  PARAMETER
} = require("./constants")

module.exports = input => {
  const tokens = []
  let current = 0

  function takeCharsWhile(predicate) {
    let value = ""
    while (predicate(input[current])) {
      value += input[current++]
    }
    return value
  }

  while (current < input.length) {
    let char = input[current]

    if (isWhitespace(char)) {
      current++
      continue
    }

    if (isNumeric(char)) {
      const value = takeCharsWhile(isNumeric)
      tokens.push({ type: NUMBER, value })
      continue
    }

    if (isAlpha(char)) {
      const value = takeCharsWhile(isAlphaNumeric)
      if (KEYWORDS[value] != null) {
        tokens.push({ type: KEYWORD, value })
      } else {
        tokens.push({ type: IDENTIFIER, value })
      }
      continue
    }

    if (char === "(" || char === ")") {
      tokens.push({ type: PAREN, value: char })
      current++
      continue
    }

    if (char === "[") {
      current++
      const value = takeCharsWhile(s => s !== "]")
      value
        .trim()
        .split(/\W+/)
        .filter(s => s !== "")
        .forEach(arg => tokens.push({ type: PARAMETER, value: arg }))
      current++
      continue
    }

    if (isOperator(char)) {
      tokens.push({ type: OPERATOR, value: char })
      current++
      continue
    }

    if (char === '"') {
      current++ // skip open quote

      const value = takeCharsWhile(s => s !== '"')
      tokens.push({ type: STRING, value })

      current++ // skip closing quote
      continue
    }

    throw TypeError(`Unrecognised character ${char}`)
  }

  return tokens
}

function isWhitespace(s) {
  return /\s/.test(s)
}

function isAlphaNumeric(s) {
  return isAlpha(s) || isNumeric(s)
}

function isAlpha(s) {
  return /[a-z]/i.test(s)
}

function isNumeric(s) {
  return /[0-9]/.test(s)
}

function isOperator(s) {
  return ["+", "-", "*", "/"].includes(s)
}
