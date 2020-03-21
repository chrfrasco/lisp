import parse, { ASTNode } from '../src/parse';
import {
  PROGRAM,
  CALL_EXPRESSION,
  NUMBER_LITERAL,
  STRING_LITERAL,
  VARIABLE_ASSIGNMENT,
  FUNCTION_DECLARATION,
  PAREN,
  OPERATOR,
  NUMBER,
  IDENTIFIER,
  STRING,
  PARAMETER,
  KEYWORD,
} from '../src/constants';
import { Token } from '../src/lexer';

test("handles empty list", () => {
  expect(parse([])).toEqual({
    type: PROGRAM,
    body: []
  })
})

test("operators", () => {
  const input: Token[] = [
    { type: PAREN, value: "(" },
    { type: OPERATOR, value: "+" },
    { type: NUMBER, value: "1" },
    { type: NUMBER, value: "1" },
    { type: PAREN, value: ")" }
  ]
  const output: ASTNode = {
    type: PROGRAM,
    body: [
      {
        type: CALL_EXPRESSION,
        name: "+",
        params: [
          { type: NUMBER_LITERAL, value: "1" },
          { type: NUMBER_LITERAL, value: "1" }
        ]
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test("identifiers", () => {
  const input: Token[] = [
    { type: PAREN, value: "(" },
    { type: IDENTIFIER, value: "add" },
    { type: NUMBER, value: "1" },
    { type: NUMBER, value: "1" },
    { type: PAREN, value: ")" }
  ]
  const output: ASTNode = {
    type: PROGRAM,
    body: [
      {
        type: CALL_EXPRESSION,
        name: "add",
        params: [
          { type: NUMBER_LITERAL, value: "1" },
          { type: NUMBER_LITERAL, value: "1" }
        ]
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test("string literals", () => {
  const input: Token[] = [
    { type: PAREN, value: "(" },
    { type: IDENTIFIER, value: "print" },
    { type: STRING, value: "hello, world" },
    { type: PAREN, value: ")" }
  ]
  const output = {
    type: PROGRAM,
    body: [
      {
        type: CALL_EXPRESSION,
        name: "print",
        params: [{ type: STRING_LITERAL, value: "hello, world" }]
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test("variable assignment", () => {
  const input: Token[] = [
    { value: "(", type: PAREN },
    { value: "def", type: KEYWORD },
    { value: "x", type: IDENTIFIER },
    { value: "1", type: NUMBER },
    { value: ")", type: PAREN }
  ]
  const output = {
    type: PROGRAM,
    body: [
      {
        type: VARIABLE_ASSIGNMENT,
        name: "x",
        value: { type: NUMBER_LITERAL, value: "1" }
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test("function declaration with no arguments", () => {
  const input: Token[] = [
    { value: "(", type: PAREN },
    { value: "fn", type: KEYWORD },
    { value: "foo", type: IDENTIFIER },
    { value: "x", type: PARAMETER },
    { value: "1", type: NUMBER },
    { value: ")", type: PAREN }
  ]
  const output: ASTNode = {
    type: PROGRAM,
    body: [
      {
        type: FUNCTION_DECLARATION,
        name: "foo",
        params: ["x"],
        body: { type: NUMBER_LITERAL, value: "1" }
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test("function declaration with multiple arguments", () => {
  let input: Token[] = [
    { value: "(", type: PAREN },
    { value: "fn", type: KEYWORD },
    { value: "foo", type: IDENTIFIER },
    { value: "x", type: PARAMETER },
    { value: "1", type: NUMBER },
    { value: ")", type: PAREN }
  ]
  let output: ASTNode = {
    type: PROGRAM,
    body: [
      {
        type: FUNCTION_DECLARATION,
        name: "foo",
        params: ["x"],
        body: { type: NUMBER_LITERAL, value: "1" }
      }
    ]
  }
  expect(parse(input)).toEqual(output)

  input = [
    { value: "(", type: PAREN },
    { value: "fn", type: KEYWORD },
    { value: "foo", type: IDENTIFIER },
    { value: "x", type: PARAMETER },
    { value: "y", type: PARAMETER },
    { value: "1", type: NUMBER },
    { value: ")", type: PAREN }
  ]
  output = {
    type: PROGRAM,
    body: [
      {
        type: FUNCTION_DECLARATION,
        name: "foo",
        params: ["x", "y"],
        body: { type: NUMBER_LITERAL, value: "1" }
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test("function declaration with complex body", () => {
  const input: Token[] = [
    { value: "(", type: PAREN },
    { value: "fn", type: KEYWORD },
    { value: "foo", type: IDENTIFIER },
    { value: "x", type: PARAMETER },
    { type: PAREN, value: "(" },
    { type: IDENTIFIER, value: "print" },
    { type: PAREN, value: "(" },
    { type: OPERATOR, value: "+" },
    { type: NUMBER, value: "1" },
    { type: NUMBER, value: "1" },
    { type: PAREN, value: ")" },
    { type: PAREN, value: ")" },
    { value: ")", type: PAREN }
  ]
  const output: ASTNode = {
    type: PROGRAM,
    body: [
      {
        type: FUNCTION_DECLARATION,
        name: "foo",
        params: ["x"],
        body: {
          name: "print",
          type: CALL_EXPRESSION,
          params: [
            {
              name: "+",
              type: CALL_EXPRESSION,
              params: [
                {
                  value: "1",
                  type: NUMBER_LITERAL
                },
                {
                  value: "1",
                  type: NUMBER_LITERAL
                }
              ]
            }
          ]
        }
      }
    ]
  }
  expect(parse(input)).toEqual(output)
})

test("nested call expressions", () => {
  const input: Token[] = [
    { type: PAREN, value: "(" },
    { type: IDENTIFIER, value: "print" },
    { type: PAREN, value: "(" },
    { type: OPERATOR, value: "+" },
    { type: NUMBER, value: "1" },
    { type: NUMBER, value: "1" },
    { type: PAREN, value: ")" },
    { type: PAREN, value: ")" }
  ]
  const output: ASTNode = {
    type: PROGRAM,
    body: [
      {
        name: "print",
        type: CALL_EXPRESSION,
        params: [
          {
            name: "+",
            type: CALL_EXPRESSION,
            params: [
              {
                value: "1",
                type: NUMBER_LITERAL
              },
              {
                value: "1",
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
