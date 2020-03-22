# lisp.js

> A naive attempt at writing an interpreter for a small lisp

## Usage

First, compile with `npm run build`. Then run with `node dist/index.js`. Can optionally be supplied with a file that will be executed. Otherwise will start a repl.

There are a couple of examples inside the `examples/` directory, e.g. `node dist/index.js examples/greet.lisp`.

### Built in operations

- `print` - calls `console.log` behind the scenes
- `concat` - concatenates many strings
- Mathematical operators (`+`, `-`, `*`, `/`, `pow`)
- Comparator operators (`>`, `<`, `>=`, `<=`, `=`)

### Data types

- Integers (backed by JS numbers. no support for decimals yet)
- Strings (enclosed in double quotes)

### Functions

Define new functions using the `fn` keyword, like this:

```lisp
(fn addTen [x] (+ 10 x))
```

Functions can only be called after they are declared.

### Variables

Define variables using the `def` keyword:

```lisp
(def name "Christian")
```

## Planned features

- [ ] Floating point numbers
- [ ] Lists/arrays
- [ ] Anonymous functions

Inspired by:
- [jamiebuilds](jamiebuilds/the-super-tiny-compiler)' "the super tiny compiler" - the lexer and parser are slightly modified versions of the ones Jamie uses
- [Rob Pike's talk on lexing](https://www.youtube.com/watch?v=HxaD_trXwRE). I didn't use any of the patterns here, but it was a useful insight into how lexing can be done
