import { isKeyword, Keyword } from "./keywords";

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

export default function lexer(input: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;

  function takeCharsWhile(predicate: (char: string) => boolean) {
    let value = "";
    while (predicate(input[current])) {
      value += input[current++];
    }
    return value;
  }

  while (current < input.length) {
    let char = input[current];

    if (isWhitespace(char)) {
      current++;
      continue;
    }

    if (isNumeric(char)) {
      const value = takeCharsWhile(isNumeric);
      tokens.push({ type: TokenKind.NUMBER, value });
      continue;
    }

    if (isAlpha(char)) {
      const value = takeCharsWhile(isAlphaNumeric);
      if (isKeyword(value)) {
        tokens.push({ type: TokenKind.KEYWORD, value });
      } else {
        tokens.push({ type: TokenKind.IDENTIFIER, value });
      }
      continue;
    }

    if (char === "(" || char === ")") {
      tokens.push({ type: TokenKind.PAREN, value: char });
      current++;
      continue;
    }

    if (char === "[") {
      current++;
      const value = takeCharsWhile(s => s !== "]");
      value
        .trim()
        .split(/\W+/)
        .filter(s => s !== "")
        .forEach(arg => tokens.push({ type: TokenKind.PARAMETER, value: arg }));
      current++;
      continue;
    }

    if (isOperator(char)) {
      tokens.push({ type: TokenKind.OPERATOR, value: char });
      current++;
      continue;
    }

    if (char === '"') {
      current++; // skip open quote

      const value = takeCharsWhile(s => s !== '"');
      tokens.push({ type: TokenKind.STRING, value });

      current++; // skip closing quote
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
