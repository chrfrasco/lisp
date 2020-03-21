import parse, { ASTNode } from '../src/parse';
import {
  PROGRAM,
  CALL_EXPRESSION,
  NUMBER_LITERAL,
  STRING_LITERAL,
  VARIABLE_ASSIGNMENT,
  FUNCTION_DECLARATION,
} from '../src/constants';
import { Token, Tokens } from '../src/lexer';

test("handles empty list", () => {
  expect(parse([])).toEqual({
    type: PROGRAM,
    body: []
  })
})

test("operators", () => {
  const input: Token[] =[
    Tokens.paren('('),
    Tokens.operator('+'),
    Tokens.number("1"),
    Tokens.number("1"),
    Tokens.paren(')'),
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
    Tokens.paren('('),
    Tokens.identifier('add'),
    Tokens.number("1"),
    Tokens.number("1"),
    Tokens.paren(')'),
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
    Tokens.paren('('),
    Tokens.identifier('print'),
    Tokens.string('hello, world'),
    Tokens.paren(')'),
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
    Tokens.paren('('),
    Tokens.keyword('def'),
    Tokens.identifier('x'),
    Tokens.number('1'),
    Tokens.paren(')'),
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
    Tokens.paren('('),
    Tokens.keyword('fn'),
    Tokens.identifier('foo'),
    Tokens.parameter('x'),
    Tokens.number('1'),
    Tokens.paren(')'),
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
    Tokens.paren('('),
    Tokens.keyword('fn'),
    Tokens.identifier('foo'),
    Tokens.parameter('x'),
    Tokens.parameter('y'),
    Tokens.number('1'),
    Tokens.paren(')'),
  ]
  let output: ASTNode = {
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

  input = [
    Tokens.paren('('),
    Tokens.keyword('fn'),
    Tokens.identifier('foo'),
    Tokens.parameter('x'),
    Tokens.parameter('y'),
    Tokens.number('1'),
    Tokens.paren(')'),
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
    Tokens.paren('('),
    Tokens.keyword('fn'),
    Tokens.identifier('foo'),
    Tokens.parameter('x'),
    Tokens.paren('('),
    Tokens.identifier('print'),
    Tokens.paren('('),
    Tokens.operator('+'),
    Tokens.number('1'),
    Tokens.number('1'),
    Tokens.paren(')'),
    Tokens.paren(')'),
    Tokens.paren(')'),
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
    Tokens.paren('('),
    Tokens.identifier('print'),
    Tokens.paren('('),
    Tokens.operator('+'),
    Tokens.number('1'),
    Tokens.number('1'),
    Tokens.paren(')'),
    Tokens.paren(')'),
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
