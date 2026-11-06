import {
  parseQuery,
  stringifyQuery,
  queryToObject,
  type QueryPair,
} from '@lp-labs/url-query-codec';
const pairs: QueryPair[] = parseQuery('a=1');
const map: Record<string, string[]> = queryToObject(pairs);
stringifyQuery(pairs);
void map;
// @ts-expect-error string values only
stringifyQuery([['a', 1]]);
