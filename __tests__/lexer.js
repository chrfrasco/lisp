const lexer = require('../src/lexer')
const {
  NUMBER,
  STRING,
  PAREN,
  OPERATOR,
  IDENTIFIER,
} = require('../src/constants')

test('exports a function', () => {
  expect(typeof lexer).toEqual('function')
})

test('transforms string into an array of tokens', () => {
  const input = `(+ 1 10)`
  const output = [
    { value: '(', type: PAREN },
    { value: '+', type: OPERATOR },
    { value: '1', type: NUMBER },
    { value: '10', type: NUMBER },
    { value: ')', type: PAREN }
  ]
  expect(lexer(input)).toEqual(output)
})

test('handles alphanumeric values', () => {
  const input = `(div 10 5)`
  const output = [
    { value: '(', type: PAREN },
    { value: 'div', type: IDENTIFIER },
    { value: '10', type: NUMBER },
    { value: '5', type: NUMBER },
    { value: ')', type: PAREN }
  ]
  expect(lexer(input)).toEqual(output)
})

test('handles strings', () => {
  const input = `(print "hello, world")`
  const output = [
    { value: '(', type: PAREN },
    { value: 'print', type: IDENTIFIER },
    { value: 'hello, world', type: STRING },
    { value: ')', type: PAREN }
  ]
  expect(lexer(input)).toEqual(output)
})
