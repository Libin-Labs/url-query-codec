import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseQuery, stringifyQuery, queryToObject } from '../dist/esm/index.js';

test('repeated values ordered', () => {
  assert.deepEqual(parseQuery('?a=1&a=2&flag'), [
    ['a', '1'],
    ['a', '2'],
    ['flag', ''],
  ]);
  assert.equal(
    stringifyQuery([
      ['a', '1'],
      ['a', '2'],
    ]),
    'a=1&a=2',
  );
});
test('spaces and reserved', () => {
  assert.equal(stringifyQuery([['a b', '+!*']]), 'a%20b=%2B%21%2A');
  assert.deepEqual(parseQuery('a+b=%2B+c', { space: 'plus' }), [['a b', '+ c']]);
  assert.deepEqual(parseQuery('a+b=c'), [['a+b', 'c']]);
});
test('malformed strict', () => {
  for (const s of ['a=%', 'a=%0g', 'a=%ff', 'a=%c0%80', 'a=\ud800'])
    assert.throws(() => parseQuery(s), SyntaxError);
  assert.throws(() => stringifyQuery([['x', '\ud800']]), SyntaxError);
});
test('prototype keys data', () => {
  const d = queryToObject(parseQuery('__proto__=x&constructor=y&__proto__=z'));
  assert.equal(Object.getPrototypeOf(d), null);
  assert.deepEqual(d.__proto__, ['x', 'z']);
  assert.deepEqual(d.constructor, ['y']);
});
test('limits exact', () => {
  assert.deepEqual(parseQuery('a=b', { maxLength: 3, maxPairs: 1 }), [['a', 'b']]);
  assert.throws(() => parseQuery('a=b', { maxLength: 2 }), RangeError);
  assert.throws(() => stringifyQuery([['a', 'b']], { maxLength: 2 }), RangeError);
  assert.throws(() => queryToObject([['a', 'b']], 0), RangeError);
});
test('empty and oracle', () => {
  assert.deepEqual(parseQuery(''), []);
  assert.deepEqual(parseQuery('&'), [
    ['', ''],
    ['', ''],
  ]);
  const pairs = [
    ['é', '😃'],
    ['a', 'b=c'],
  ];
  assert.deepEqual(parseQuery(stringifyQuery(pairs)), pairs);
  assert.deepEqual(parseQuery(new URLSearchParams(pairs).toString(), { space: 'plus' }), pairs);
});
test('all scalar escapes against form oracle', () => {
  const pairs = Array.from({ length: 100 }, (_, i) => [
    'k' + i,
    String.fromCodePoint(0x100 + i * 113) + ' +/?#=&',
  ]);
  const encoded = stringifyQuery(pairs, { space: 'plus' });
  assert.deepEqual(parseQuery(encoded, { space: 'plus' }), [...new URLSearchParams(encoded)]);
  assert.deepEqual(parseQuery(encoded, { space: 'plus' }), pairs);
});
test('no URL interpretation or inherited map values', () => {
  assert.deepEqual(parseQuery('x=a#b&x=%00'), [
    ['x', 'a#b'],
    ['x', '\0'],
  ]);
  const map = queryToObject([
    ['toString', 'a'],
    ['hasOwnProperty', 'b'],
  ]);
  assert.deepEqual(map.toString, ['a']);
  assert.deepEqual(map.hasOwnProperty, ['b']);
});
test('encoding and pair exact bounds', () => {
  assert.equal(stringifyQuery([['é', 'x']], { maxLength: 8, maxPairs: 1 }), '%C3%A9=x');
  assert.throws(() => stringifyQuery([['é', 'x']], { maxLength: 7 }), RangeError);
  assert.throws(() => parseQuery('a=1&b=2', { maxPairs: 1 }), RangeError);
  assert.throws(() => queryToObject(new Array(1)), TypeError);
});
