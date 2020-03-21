import { isKeyword, Keyword } from "./keywords";
import { MutableLocation, Reader } from "./reader";

export enum TokenKind {
  NUMBER = "NUMBER",
  STRING = "STRING",
  PAREN = "PAREN",
  OPERATOR = "OPERATOR",
  IDENTIFIER = "IDENTIFIER",
  KEYWORD = "KEYWORD",
  PARAMETER = "PARAMETER"
}

export type Token =
  | {
      type: Exclude<TokenKind, TokenKind.KEYWORD | TokenKind.OPERATOR>;
      value: string;
    }
  | { type: TokenKind.KEYWORD; value: Keyword }
  | { type: TokenKind.OPERATOR; value: OperatorChar };

export const Tokens = {
  paren(value: string): Token {
    return { type: TokenKind.PAREN, value };
  },
  number(value: string): Token {
    return { type: TokenKind.NUMBER, value };
  },
  operator(value: OperatorChar): Token {
    return { type: TokenKind.OPERATOR, value };
  },
  identifier(value: string): Token {
    return { type: TokenKind.IDENTIFIER, value };
  },
  string(value: string): Token {
    return { type: TokenKind.STRING, value };
  },
  keyword(value: Keyword): Token {
    return { type: TokenKind.KEYWORD, value };
  },
  parameter(value: string): Token {
    return { type: TokenKind.PARAMETER, value };
  }
};

export default function lexer(source: string): Token[] {
  const tokens: Token[] = [];
  const location = new MutableLocation();
  const reader = new Reader(source, location);

  while (reader.hasMoreChars()) {
    let char = reader.peek();

    if (isWhitespace(char)) {
      reader.next();
      continue;
    }

    if (isNumeric(char)) {
      const value = reader.takeCharsWhile(isNumeric);
      tokens.push(Tokens.number(value));
      continue;
    }

    if (isAlpha(char)) {
      const value = reader.takeCharsWhile(isAlphaNumeric);
      if (isKeyword(value)) {
        tokens.push(Tokens.keyword(value));
      } else {
        tokens.push(Tokens.identifier(value));
      }
      continue;
    }

    if (char === "(" || char === ")") {
      tokens.push(Tokens.paren(char));
      reader.next();
      continue;
    }

    if (char === "[") {
      reader.next();
      const value = reader.takeCharsWhile(s => s !== "]");
      value
        .trim()
        .split(/\W+/)
        .filter(s => s !== "")
        .forEach(arg => tokens.push(Tokens.parameter(arg)));
      reader.next();
      continue;
    }

    if (isOperator(char)) {
      tokens.push(Tokens.operator(char));
      reader.next();
      continue;
    }

    if (char === '"' || char === `'`) {
      const quoteKind = char;
      reader.next(); // skip open quote

      const value = reader.takeCharsWhile(s => s !== quoteKind);
      tokens.push(Tokens.string(value));

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

type OperatorChar = "+" | "-" | "*" | "/";
const operatorChars: string[] = ["+", "-", "*", "/"];
function isOperator(s: string): s is OperatorChar {
  return operatorChars.includes(s);
}
