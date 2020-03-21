export type Keyword = "fn" | "def";

const allKeywords: Record<Keyword, null> = {
  fn: null,
  def: null
};

const keywords = new Set(Object.keys(allKeywords));

export function isKeyword(x: string): x is Keyword {
  return keywords.has(x);
}
