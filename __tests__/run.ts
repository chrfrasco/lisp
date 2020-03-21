import run from '../src/run';
import { ASTNode, ASTNodeKind } from '../src/parse';
import { DEFAULT_GLOBALS } from '../src/constants';

test("runs a full program", () => {
  const program: ASTNode = {
    type: ASTNodeKind.PROGRAM,
    body: [
      {
        type: ASTNodeKind.CALL_EXPRESSION,
        name: "print",
        params: [{ type: ASTNodeKind.STRING_LITERAL, value: "hello, world" }]
      }
    ]
  }
  expect(run(program))
})

test("globals can be mocked", () => {
  const program: ASTNode = {
    type: ASTNodeKind.CALL_EXPRESSION,
    name: "print",
    params: [{ type: ASTNodeKind.STRING_LITERAL, value: "hello, world" }]
  }
  const print = jest.fn()
  const mockedGlobals = Object.assign({}, DEFAULT_GLOBALS, {
    print
  })
  run(program, mockedGlobals)
  expect(print.mock.calls.length).toEqual(1)
  expect(print.mock.calls[0][0]).toEqual("hello, world")
})

test("adds two numbers", () => {
  const program: ASTNode = {
    type: ASTNodeKind.CALL_EXPRESSION,
    name: "+",
    params: [
      { type: ASTNodeKind.NUMBER_LITERAL, value: "1" },
      { type: ASTNodeKind.NUMBER_LITERAL, value: "1" }
    ]
  }
  expect(run(program)).toEqual(2)
})

test("can assign variables", () => {
  const program: ASTNode = {
    type: ASTNodeKind.PROGRAM,
    body: [
      {
        type: ASTNodeKind.VARIABLE_ASSIGNMENT,
        name: "x",
        value: { type: ASTNodeKind.NUMBER_LITERAL, value: "1" }
      }
    ]
  }
  const globals = Object.assign({}, DEFAULT_GLOBALS)
  run(program, globals)
  // TODO(christianscott): remove any cast
  expect((globals as any).x).toBe(1)
})

test("function declaration", () => {
  const program: ASTNode = {
    type: ASTNodeKind.PROGRAM,
    body: [
      {
        type: ASTNodeKind.FUNCTION_DECLARATION,
        name: "add",
        params: ["x", "y"],
        body: {
          name: "+",
          type: ASTNodeKind.CALL_EXPRESSION,
          params: [
            {
              value: "x",
              type: ASTNodeKind.IDENTIFIER
            },
            {
              value: "y",
              type: ASTNodeKind.IDENTIFIER
            }
          ]
        }
      },
      {
        type: ASTNodeKind.CALL_EXPRESSION,
        name: "print",
        params: [
          {
            name: "add",
            type: ASTNodeKind.CALL_EXPRESSION,
            params: [
              {
                value: "1",
                type: ASTNodeKind.NUMBER_LITERAL
              },
              {
                value: "1",
                type: ASTNodeKind.NUMBER_LITERAL
              }
            ]
          }
        ]
      }
    ]
  }
  const print = jest.fn()
  const mockedGlobals = Object.assign({}, DEFAULT_GLOBALS, {
    print
  })
  run(program, mockedGlobals)
  expect(print.mock.calls.length).toEqual(1)
  expect(print.mock.calls[0][0]).toEqual(2)
})
