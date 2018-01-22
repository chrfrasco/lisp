module.exports = (input) => {
  const tokens = []
  let current = 0

  while (current < input.length) {
    let char = input[current]

    if (isWhitespace(char)) {
      current++
      continue
    }
    
    if (isNumeric(char)) {
      let token = ''
      while (isNumeric(char)) {
        token += char
        char = input[++current]
      }
      tokens.push({ type: 'number', value: token })
      continue
    }

    if (isAlpha(char)) {
      let token = ''
      while (isAlpha(char) || isNumeric(char)) {
        token += char
        char = input[++current]
      }
      tokens.push({ type: 'identifier', value: token })
      continue
    }

    if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char })
      current++
      continue
    }

    if (isOperator(char)) {
      tokens.push({ type: 'operator', value: char })
      current++
      continue
    }

    if (char === '"') {
      let token = ''
      char = input[++current] // skip opening quote
      while (char !== '"') {
        token += char
        char = input[++current]
      }
      tokens.push({ type: 'string', value: token })
      char = input[++current] // skip closing quote
      continue
    }

    throw `Unrecognised character ${char}`
  }

  return tokens
}

function isWhitespace(s) {
  return /\s/.test(s)
}

function isAlpha(s) {
  return /[a-z]/i.test(s)
}

function isNumeric(s) {
  return /[0-9]+/.test(s)
}

function isOperator(s) {
  return ['+', '-', '*', '/'].includes(s)
}

