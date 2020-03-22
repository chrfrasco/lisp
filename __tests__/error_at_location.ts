import { ErrorAtLocation } from '../src/error_at_location'
import { ImmutableLocation } from '../src/reader';

class ErrForTesting extends ErrorAtLocation {}

test('single line of source', () => {
  const err = new ErrForTesting('message', new ImmutableLocation(0, 0, 0));
  expect(err.printWithSource('single line source'))
    .toBe('single line source\n^ ErrForTesting: message');
});

test('single line of source not at start of line', () => {
  const err = new ErrForTesting('message', new ImmutableLocation(0, 7, 0));
  expect(err.printWithSource('single line source'))
    .toBe('single line source\n       ^ ErrForTesting: message');
});

test('multiple lines of source', () => {
  const err = new ErrForTesting('message', new ImmutableLocation(0, 0, 1));
  expect(err.printWithSource('first line\nsecond line'))
    .toBe('second line\n^ ErrForTesting: message');
});

test('multiple lines of source not at start of line', () => {
  const err = new ErrForTesting('message', new ImmutableLocation(0, 7, 1));
  expect(err.printWithSource('first line\nsecond line'))
    .toBe('second line\n       ^ ErrForTesting: message');
});
