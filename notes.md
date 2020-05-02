# notes

## expressions are eagerly evaluated

This causes a few severe problems. Firstly, branching is broken if the branches have side-effects, e.g.

```
> (fn f [x] (if x (print "true") (print "false")))
fn f
> (f true)
true
false
nil
>
```

This should just print true. Secondly, because of broken branching there's no way to do recursion:

```
> (fn i [a b] (if (= b 0) a (+ a (i a (- b 1)))))
fn i
> (i 1 0)

/Users/christianscott/Code/github.com/christianscott/lisp/src/scope.ts:73
    this.variables = new Map(variables);
                     ^
RangeError: Maximum call stack size exceeded
    at Map.set (<anonymous>)
    at new Map (<anonymous>)
    at new Scope (/Users/christianscott/Code/github.com/christianscott/lisp/src/scope.ts:73:22)
    at Scope.with (/Users/christianscott/Code/github.com/christianscott/lisp/src/scope.ts:149:12)
    at /Users/christianscott/Code/github.com/christianscott/lisp/src/run.ts:110:35
    at run (/Users/christianscott/Code/github.com/christianscott/lisp/src/run.ts:53:25)
    at /Users/christianscott/Code/github.com/christianscott/lisp/src/run.ts:41:47
    at Array.map (<anonymous>)
    at run (/Users/christianscott/Code/github.com/christianscott/lisp/src/run.ts:41:34)
    at /Users/christianscott/Code/github.com/christianscott/lisp/src/run.ts:41:47
```

This should return 1, but the "else" branch of the "if" expression is being evaluated every time the function is called. To fix this I need to introduce the notion of lazy expressions/lazy evaulation.
