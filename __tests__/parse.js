const parse = require('../src/parse')
const {
  PROGRAM,
  CALL_EXPRESSION,
  NUMBER_LITERAL,
  STRING_LITERAL,
  VARIABLE_ASSIGNMENT,
  PAREN,
  OPERATOR,
  NUMBER,
  IDENTIFIER,
  STRING,
  KEYWORD
} = require('../src/constants')

test('exports a function', () => {
  expect(typeof parse).toEqual('function')
})

test('handles empty list', () => {
  expect(parse([])).toEqual({
    type: PROGRAM,
    body: []
  })
})

test('operators', () => {
  const input = [
    { type: PAREN, value: '(' },
    { type: OPERATOR, value: '+' },
    { type: NUMBER, value: '1' },
    { type: NUMBER, value: '1' },
    { type: PAREN, value: ')' }
  ]
  const output = {
    type: PROGRAM,
    body: [
      {
        type: CALL_EXPRESSION,
        name: '+',
        params: [
          { type: NUMBER_LITERAL, value: '1' },
          { type: NUMBER_LITERAL, value: '1' },
        ]
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test('identifiers', () => {
  const input = [
    { type: PAREN, value: '(' },
    { type: IDENTIFIER, value: 'add' },
    { type: NUMBER, value: '1' },
    { type: NUMBER, value: '1' },
    { type: PAREN, value: ')' }
  ]
  const output = {
    type: PROGRAM,
    body: [
      {
        type: CALL_EXPRESSION,
        name: 'add',
        params: [
          { type: NUMBER_LITERAL, value: '1' },
          { type: NUMBER_LITERAL, value: '1' },
        ]
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test('string literals', () => {
  const input = [
    { type: PAREN, value: '(' },
    { type: IDENTIFIER, value: 'print' },
    { type: STRING, value: 'hello, world' },
    { type: PAREN, value: ')' }
  ]
  const output = {
    type: PROGRAM,
    body: [
      {
        type: CALL_EXPRESSION,
        name: 'print',
        params: [
          { type: STRING_LITERAL, value: 'hello, world' },
        ]
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test('variable assignment', () => {
  const input = [
    { value: '(', type: PAREN },
    { value: 'def', type: KEYWORD },
    { value: 'x', type: IDENTIFIER },
    { value: '1', type: NUMBER },
    { value: ')', type: PAREN }
  ]
  const output = {
    type: PROGRAM,
    body: [
      {
        type: VARIABLE_ASSIGNMENT,
        name: 'x',
        value: { type: NUMBER_LITERAL, value: '1' }
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test('nested call expressions', () => {
  const input = [
    { type: PAREN, value: '(' },
    { type: IDENTIFIER, value: 'print' },
    { type: PAREN, value: '(' },
    { type: OPERATOR, value: '+' },
    { type: NUMBER, value: '1' },
    { type: NUMBER, value: '1' },
    { type: PAREN, value: ')' },
    { type: PAREN, value: ')' }
  ]
  const output = {
    type: PROGRAM,
    body: [
      {
        name: 'print',
        type: CALL_EXPRESSION,
        params: [
          {
            name: '+',
            type: CALL_EXPRESSION,
            params: [
              {
                value: '1',
                type: NUMBER_LITERAL,
              },
              {
                value: '1',
                type: NUMBER_LITERAL
              }
            ]
          }
        ]
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})