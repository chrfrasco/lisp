import { isKeyword } from "./keywords";
import { MutableLocation, Reader } from "./reader";
import { Token, Tokens, OperatorChar } from "./tokens";

export default function lexer(source: string): Token[] {
  const tokens: Token[] = [];
  const _location = new MutableLocation();
  const reader = new Reader(source, _location);

  while (reader.hasMoreChars()) {
    let char = reader.peek();

    if (char === '\n') {
      tokens.push(Tokens.newline(reader.currentLocation()));
      reader.next();
      continue;
    }

    if (isWhitespace(char)) {
      reader.next();
      continue;
    }

    if (isNumeric(char)) {
      const location = reader.currentLocation();
      const value = reader.takeCharsWhile(isNumeric);
      tokens.push(Tokens.number(value, location));
      continue;
    }

    if (isAlpha(char)) {
      const location = reader.currentLocation();
      const value = reader.takeCharsWhile(isAlphaNumeric);
      if (isKeyword(value)) {
        tokens.push(Tokens.keyword(value, location));
      } else {
        tokens.push(Tokens.identifier(value, location));
      }
      continue;
    }

    if (char === "(" || char === ")") {
      const location = reader.currentLocation();
      tokens.push(Tokens.paren(char, location));
      reader.next();
      continue;
    }

    if (char === "[") {
      while (reader.peek() !== ']') {
        reader.next();
        const location = reader.currentLocation();
        const value = reader.takeCharsWhile(s => !isWhitespace(s) && s !== "]");
        value && tokens.push(Tokens.parameter(value, location));
      }

      reader.next();
      continue;
    }

    if (isOperator(char)) {
      tokens.push(Tokens.operator(char, reader.currentLocation()));
      reader.next();
      continue;
    }

    if (char === '"' || char === `'`) {
      const location = reader.currentLocation();
      const quoteKind = char;
      reader.next(); // skip open quote

      const value = reader.takeCharsWhile(s => s !== quoteKind);
      tokens.push(Tokens.string(value, location));

      reader.next(); // skip closing quote
      continue;
    }

    throw TypeError(`Unrecognised character ${char}`);
  }

  return tokens;
}

function isWhitespace(s: string): boolean {
  return /\s/.test(s);
}

function isAlphaNumeric(s: string): boolean {
  return isAlpha(s) || isNumeric(s);
}

function isAlpha(s: string): boolean {
  return /[a-z]/i.test(s);
}

function isNumeric(s: string): boolean {
  return /[0-9]/.test(s);
}

const operatorChars: string[] = ["+", "-", "*", "/"];
function isOperator(s: string): s is OperatorChar {
  return operatorChars.includes(s);
}
