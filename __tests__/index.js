const lisp = require('../')
const constants = require('../src/constants')

test('exports a function', () => {
  expect(typeof lisp).toEqual('function')
})

test('does not return anything', () => {
  const ret = lisp(`(+ 1 1)`)
  expect(ret).toBeUndefined()
})

test('runs correctly', () => {
  const print = jest.fn()
  const mockedGlobals = Object.assign({}, constants.DEFAULT_GLOBALS, {
    print
  })
  lisp(`(print (+ 1 1))`, mockedGlobals)
  expect(print.mock.calls.length).toEqual(1)
  expect(print.mock.calls[0][0]).toEqual(2)
})

test('multi-statement programs', () => {
  const print = jest.fn()
  const mockedGlobals = Object.assign({}, constants.DEFAULT_GLOBALS, {
    print
  })
  lisp(`(print "hello, ")
(print "world")`, mockedGlobals)
  expect(print.mock.calls.length).toBe(2)
  expect(print.mock.calls[0][0]).toEqual("hello, ")
  expect(print.mock.calls[1][0]).toEqual("world")
})

test('variable assignment', () => {
  const print = jest.fn()
  const mockedGlobals = Object.assign({}, constants.DEFAULT_GLOBALS, {
    print
  })
  lisp(`(def x 1)
(print x)`, mockedGlobals)
  expect(print.mock.calls.length).toBe(1)
  expect(print.mock.calls[0][0]).toEqual(1)
})
