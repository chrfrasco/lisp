const readline = require('readline')
const lisp = require('./')

const lineReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

ask()

function ask() {
  lineReader.question('> ', answer => {
    if (answer === '.exit') {
      process.exit(0)
    }

    lisp(answer)
    ask()
  })
}
