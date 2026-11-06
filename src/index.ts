export type QueryPair = readonly [string, string];
export interface QueryOptions {
  space?: 'percent' | 'plus';
  maxLength?: number;
  maxPairs?: number;
}
function config(o: QueryOptions): { max: number; pairs: number; plus: boolean } {
  const max = o.maxLength ?? 1_048_576,
    pairs = o.maxPairs ?? 10000;
  if (!Number.isSafeInteger(max) || max < 0 || !Number.isSafeInteger(pairs) || pairs < 0)
    throw new RangeError('Invalid limits');
  if (o.space !== undefined && o.space !== 'percent' && o.space !== 'plus')
    throw new TypeError('Invalid space mode');
  return { max, pairs, plus: o.space === 'plus' };
}
function decode(s: string, plus: boolean): string {
  try {
    return decodeURIComponent(plus ? s.replace(/\+/g, ' ') : s);
  } catch {
    throw new SyntaxError('Malformed percent encoding or UTF-8');
  }
}
function encode(s: string, plus: boolean): string {
  try {
    const result = encodeURIComponent(s).replace(
      /[!'()*]/g,
      (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
    );
    return plus ? result.replace(/%20/g, '+') : result;
  } catch {
    throw new SyntaxError('Lone surrogate');
  }
}
function scalar(s: string): void {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const d = s.charCodeAt(++i);
      if (!(d >= 0xdc00 && d <= 0xdfff)) throw new SyntaxError('Lone surrogate');
    } else if (c >= 0xdc00 && c <= 0xdfff) throw new SyntaxError('Lone surrogate');
  }
}
export function parseQuery(text: string, o: QueryOptions = {}): QueryPair[] {
  const c = config(o);
  if (text.length > c.max) throw new RangeError('Text limit exceeded');
  if (text.startsWith('?')) text = text.slice(1);
  if (text === '') return [];
  scalar(text);
  const out: QueryPair[] = [];
  for (const part of text.split('&')) {
    if (out.length >= c.pairs) throw new RangeError('Pair limit exceeded');
    const at = part.indexOf('=');
    out.push([
      decode(at < 0 ? part : part.slice(0, at), c.plus),
      decode(at < 0 ? '' : part.slice(at + 1), c.plus),
    ]);
  }
  return out;
}
export function stringifyQuery(pairs: Iterable<QueryPair>, o: QueryOptions = {}): string {
  const c = config(o),
    out: string[] = [];
  let length = 0;
  for (const [key, value] of pairs) {
    if (out.length >= c.pairs) throw new RangeError('Pair limit exceeded');
    if (typeof key !== 'string' || typeof value !== 'string')
      throw new TypeError('Pairs must contain strings');
    const part = encode(key, c.plus) + '=' + encode(value, c.plus);
    length += part.length + (out.length ? 1 : 0);
    if (length > c.max) throw new RangeError('Text limit exceeded');
    out.push(part);
  }
  return out.join('&');
}
export function queryToObject(
  pairs: Iterable<QueryPair>,
  maxPairs = 10000,
): Record<string, string[]> {
  const c = config({ maxPairs }),
    out: Record<string, string[]> = Object.create(null) as Record<string, string[]>;
  let count = 0;
  for (const [key, value] of pairs) {
    if (++count > c.pairs) throw new RangeError('Pair limit exceeded');
    if (typeof key !== 'string' || typeof value !== 'string')
      throw new TypeError('Pairs must contain strings');
    if (!Object.hasOwn(out, key)) out[key] = [];
    out[key]!.push(value);
  }
  return out;
}
