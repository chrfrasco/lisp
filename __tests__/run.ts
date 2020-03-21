const run = require("../src/run")
const constants = require("../src/constants")

test("runs a full program", () => {
  const program = {
    type: constants.PROGRAM,
    body: [
      {
        type: constants.CALL_EXPRESSION,
        name: "print",
        params: [{ type: constants.STRING_LITERAL, value: "hello, world" }]
      }
    ]
  }
  expect(run(program))
})

test("globals can be mocked", () => {
  const program = {
    type: constants.CALL_EXPRESSION,
    name: "print",
    params: [{ type: constants.STRING_LITERAL, value: "hello, world" }]
  }
  const print = jest.fn()
  const mockedGlobals = Object.assign({}, constants.DEFAULT_GLOBALS, {
    print
  })
  run(program, mockedGlobals)
  expect(print.mock.calls.length).toEqual(1)
  expect(print.mock.calls[0][0]).toEqual("hello, world")
})

test("adds two numbers", () => {
  const program = {
    type: constants.CALL_EXPRESSION,
    name: "+",
    params: [
      { type: constants.NUMBER_LITERAL, value: "1" },
      { type: constants.NUMBER_LITERAL, value: "1" }
    ]
  }
  expect(run(program)).toEqual(2)
})

test("can assign variables", () => {
  const program = {
    type: constants.PROGRAM,
    body: [
      {
        type: constants.VARIABLE_ASSIGNMENT,
        name: "x",
        value: { type: constants.NUMBER_LITERAL, value: "1" }
      }
    ]
  }
  const mockedGlobals = Object.assign({}, constants.DEFAULT_GLOBALS)
  run(program, mockedGlobals)
  expect(mockedGlobals.x).toBe(1)
})

test("throws an error when given a program containing invalid tokens", () => {
  const program = {
    type: "__GARBAGE__",
    value: null
  }
  expect(() => run(program)).toThrow(TypeError)
})

test("function declaration", () => {
  const program = {
    type: constants.PROGRAM,
    body: [
      {
        type: constants.FUNCTION_DECLARATION,
        name: "add",
        params: ["x", "y"],
        body: {
          name: "+",
          type: constants.CALL_EXPRESSION,
          params: [
            {
              value: "x",
              type: constants.IDENTIFIER
            },
            {
              value: "y",
              type: constants.IDENTIFIER
            }
          ]
        }
      },
      {
        type: constants.CALL_EXPRESSION,
        name: "print",
        params: [
          {
            name: "add",
            type: constants.CALL_EXPRESSION,
            params: [
              {
                value: "1",
                type: constants.NUMBER_LITERAL
              },
              {
                value: "1",
                type: constants.NUMBER_LITERAL
              }
            ]
          }
        ]
      }
    ]
  }
  const print = jest.fn()
  const mockedGlobals = Object.assign({}, constants.DEFAULT_GLOBALS, {
    print
  })
  run(program, mockedGlobals)
  expect(print.mock.calls.length).toEqual(1)
  expect(print.mock.calls[0][0]).toEqual(2)
})
