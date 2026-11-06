# @lp-labs/url-query-codec

Strict percent-encoded query pairs with repeated values and safe maps.

## Install

```sh
npm install @lp-labs/url-query-codec
```

Node.js 18+; standalone browser-compatible ES2022 core with DOM codec types. Zero runtime or peer dependencies. ESM and CommonJS with separate declarations. No filesystem, network or environment side effects.

## Quickstart

```js
import { parseQuery, stringifyQuery, queryToObject } from '@lp-labs/url-query-codec';
const pairs = parseQuery('?tag=one&tag=two&name=A+B', { space: 'plus' });
console.log(queryToObject(pairs).tag, stringifyQuery(pairs));
```

CommonJS consumers use `const api = require('@lp-labs/url-query-codec')`. The same named API is available in both module formats. No default export.

## API, behavior, errors and limits

parseQuery preserves pair order and repeated values, strips one optional leading '?', separates on '&' and first '='; missing '=' means empty value, empty query means no pairs, empty segments mean ['', '']. No fragment stripping or nested/bracket syntax. QueryPair is a readonly two-string tuple. space defaults 'percent' (literal '+'); 'plus' enables form-style plus-space decoding/encoding. stringifyQuery emits RFC3986 unreserved encoding and '=' for every pair, without '?'. Invalid percent triplets, UTF-8, and lone surrogates throw SyntaxError. queryToObject builds fresh null-prototype own-property string-array maps including **proto**. maxLength defaults 1,048,576 UTF-16 units and maxPairs 10,000; queryToObject takes maxPairs as its second argument. RangeError bounds, TypeError invalid modes/pair types. Linear input/output work and space; iterable consumption stops at first bound violation.

All exports: `QueryPair`, `QueryOptions`, `parseQuery`, `stringifyQuery`, `queryToObject`.

## Full TypeScript declarations

```ts
export type QueryPair = readonly [string, string];
export interface QueryOptions {
  space?: 'percent' | 'plus';
  maxLength?: number;
  maxPairs?: number;
}
export declare function parseQuery(text: string, o?: QueryOptions): QueryPair[];
export declare function stringifyQuery(pairs: Iterable<QueryPair>, o?: QueryOptions): string;
export declare function queryToObject(
  pairs: Iterable<QueryPair>,
  maxPairs?: number,
): Record<string, string[]>;
```

## Development

```sh
npm ci --offline
npm run typecheck
npm test
npm run format:check
```

TypeScript ^5.9.3 and Prettier ^3.6.2 are development-only. Build emits dist/esm and dist/cjs. Tests use Node's test runner; consumer.mts and consumer.cts exercise bare package imports including negative type assertions.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
