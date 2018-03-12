const lexer = require("../src/lexer")
const {
  NUMBER,
  STRING,
  PAREN,
  OPERATOR,
  IDENTIFIER,
  KEYWORD,
  PARAMETER
} = require("../src/constants")

test("exports a function", () => {
  expect(typeof lexer).toEqual("function")
})

test("transforms string into an array of tokens", () => {
  const input = `(+ 1 10)`
  const output = [
    { value: "(", type: PAREN },
    { value: "+", type: OPERATOR },
    { value: "1", type: NUMBER },
    { value: "10", type: NUMBER },
    { value: ")", type: PAREN }
  ]
  expect(lexer(input)).toEqual(output)
})

test("handles alphanumeric values", () => {
  const input = `(div 10 5)`
  const output = [
    { value: "(", type: PAREN },
    { value: "div", type: IDENTIFIER },
    { value: "10", type: NUMBER },
    { value: "5", type: NUMBER },
    { value: ")", type: PAREN }
  ]
  expect(lexer(input)).toEqual(output)
})

test("handles strings", () => {
  const input = `(print "hello, world")`
  const output = [
    { value: "(", type: PAREN },
    { value: "print", type: IDENTIFIER },
    { value: "hello, world", type: STRING },
    { value: ")", type: PAREN }
  ]
  expect(lexer(input)).toEqual(output)
})

test("handles keywords", () => {
  let input = `(def x 1)`
  let output = [
    { value: "(", type: PAREN },
    { value: "def", type: KEYWORD },
    { value: "x", type: IDENTIFIER },
    { value: "1", type: NUMBER },
    { value: ")", type: PAREN }
  ]
  expect(lexer(input)).toEqual(output)

  input = `(fn foo [x y] 1)`
  output = [
    { value: "(", type: PAREN },
    { value: "n", type: KEYWORD },
    { value: "foo", type: IDENTIFIER },
    { value: "x", type: PARAMETER },
    { value: "y", type: PARAMETER },
    { value: "1", type: NUMBER },
    { value: ")", type: PAREN }
  ]
  expect(lexer(input)).toEqual(output)
})
