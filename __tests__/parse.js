const parse = require('../src/parse')
const {
  PROGRAM,
  CALL_EXPRESSION,
  NUMBER_LITERAL,
  STRING_LITERAL,
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
  const input = ['(', '+', '1', '1', ')']
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
})

test('identifiers', () => {
  const input = ['(', 'add', '1', '1', ')']
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
})

test('string literals', () => {
  const input = ['(', 'print', '"hello, world"', ')']
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
})

test('nested call expressions', () => {
  const input = ['(', 'print', '(', '+', '1', '1', ')', ')']
  const output = {
    type: PROGRAM,
    body: [
      {
        type: CALL_EXPRESSION,
        name: 'print',
        params: [
          {
            type: CALL_EXPRESSION,
            name: 'print',
            params: [
              { type: STRING_LITERAL, value: 'hello, world' },
            ]
          }
        ]
      }
    ]
  }
})