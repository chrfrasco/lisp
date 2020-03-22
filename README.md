# lisp.js

> A naive attempt at writing an interpreter for a small lisp

## Usage

The easiest way to run this is with `ts-node`:

```
$ npx ts-node src/index.ts
> (fn greet [name] (concat "hello, " name"))
> (print (greet "world"))
hello, world
nil
>
```

If you pass a filename it will execute the script:

```
$ npx ts-node src/index.ts examples/referece_error.lisp
(print y)
       ^ ReferenceError: y is not defined
```

### Built in operations

- `print` - calls `console.log` behind the scenes
- `concat` - concatenates many strings
- Mathematical operators (`+`, `-`, `*`, `/`, `pow`)
- Comparator operators (`>`, `<`, `>=`, `<=`, `=`, `!=`)
- Boolean operators (`or`, `and`, `xor`, `not`)

### Data types

- Integers
- Strings
- Booleans
- Nil (`undefined`)

All are backed by the JS equivalent.

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
