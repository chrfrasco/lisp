(fn fibb [n]
  (if
    (>= n 1)
    n
    (+ (fibb (- n 1)) (- n 2))))

(print (fibb 5))
