const lexer = require('../src/lexer')

test('exports a function', () => {
  expect(typeof lexer).toEqual('function')
})

test('transforms string into an array of tokens', () => {
  const input = `(+ 1 10)`
  const output = [
    { value: '(', type: 'paren' },
    { value: '+', type: 'operator' },
    { value: '1', type: 'number' },
    { value: '10', type: 'number' },
    { value: ')', type: 'paren' }
  ]
  expect(lexer(input)).toEqual(output)
})

test('handles alphanumeric values', () => {
  const input = `(div 10 5)`
  const output = [
    { value: '(', type: 'paren' },
    { value: 'div', type: 'identifier' },
    { value: '10', type: 'number' },
    { value: '5', type: 'number' },
    { value: ')', type: 'paren' }
  ]
  expect(lexer(input)).toEqual(output)
})

test('handles strings', () => {
  const input = `(print "hello, world")`
  const output = [
    { value: '(', type: 'paren' },
    { value: 'print', type: 'identifier' },
    { value: 'hello, world', type: 'string' },
    { value: ')', type: 'paren' }
  ]
  expect(lexer(input)).toEqual(output)
})
