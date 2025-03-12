import { describe, expect, it } from "@jest/globals";
import { parseArgsArray } from "../../src/utils/parse";

describe.each([
  ...dataProvider(),
])(
  'Parse Args Array Test',
  (argv, expectedPositional, expectedOptional) => {
    it('', () => {
      const [positional, optional] = parseArgsArray(argv);
      expect(positional).toEqual(expectedPositional);
      expect(optional).toEqual(expectedOptional);
    });
  },
);

function dataProvider(): [string[], string[], Record<string, string[]>][] {
  return [
    [
      [],
      [],
      {},
    ],
    [
      ['a'],
      ['a'],
      {},
    ],
    [
      ['aaa'],
      ['aaa'],
      {},
    ],
    [
      ['aaa', 'bbb', 'ccc'],
      ['aaa', 'bbb', 'ccc'],
      {},
    ],
    [
      ['-a'],
      [],
      {
        '-a': [],
      },
    ],
    [
      ['-a', '-b'],
      [],
      {
        '-a': [],
        '-b': [],
      },
    ],
    [
      ['-ab'],
      [],
      {
        '-a': [],
        '-b': [],
      },
    ],
    [
      ['-abc'],
      [],
      {
        '-a': [],
        '-b': [],
        '-c': [],
      },
    ],
    [
      ['-a', '-bc'],
      [],
      {
        '-a': [],
        '-b': [],
        '-c': [],
      },
    ],



    [
      ['-a', '1', '-b', '2', '-c', '3'],
      [],
      {
        '-a': ['1'],
        '-b': ['2'],
        '-c': ['3'],
      },
    ],
    [
      ['-a', '-b', '2', '-c', '3'],
      [],
      {
        '-a': [],
        '-b': ['2'],
        '-c': ['3'],
      },
    ],
    [
      ['--first', '-b', '2', '-c', '3'],
      [],
      {
        '--first': [],
        '-b': ['2'],
        '-c': ['3'],
      },
    ],
    [
      ['--first', '-b', '2', '3', '-c', '4'],
      [],
      {
        '--first': [],
        '-b': ['2', '3'],
        '-c': ['4'],
      },
    ],
    [
      ['--first', '123', '-b', '2', '-c'],
      [],
      {
        '--first': ['123'],
        '-b': ['2'],
        '-c': [],
      },
    ],
    [
      ['--first', '123', '456', '-b', '2', '-c'],
      [],
      {
        '--first': ['123', '456'],
        '-b': ['2'],
        '-c': [],
      },
    ],
    [
      ['--first', '123', '-abc', '--second', '222'],
      [],
      {
        '--first': ['123'],
        '--second': ['222'],
        '-a': [],
        '-b': [],
        '-c': [],
      },
    ],
    [
      ['--first', '123', '234', '-abc', '--second', '111', '222', '333'],
      [],
      {
        '--first': ['123', '234'],
        '--second': ['111', '222', '333'],
        '-a': [],
        '-b': [],
        '-c': [],
      },
    ],
    [
      ['--first', '123', '-abc', 'test', '--second', '222'],
      [],
      {
        '--first': ['123'],
        '--second': ['222'],
        '-a': [],
        '-b': [],
        '-c': ['test'],
      },
    ],
    [
      ['--first', '123', '-abc', '1', '2', '--second', '222'],
      [],
      {
        '--first': ['123'],
        '--second': ['222'],
        '-a': [],
        '-b': [],
        '-c': ['1', '2'],
      },
    ],
    [
      ['pos1', '--first', '123', '-abc', 'test', '--second', '222'],
      ['pos1'],
      {
        '--first': ['123'],
        '--second': ['222'],
        '-a': [],
        '-b': [],
        '-c': ['test'],
      },
    ],
    [
      ['pos1', 'pos-2', 'pos--3', '--first', '123', '-abc', 'test', '--second', '222'],
      ['pos1', 'pos-2', 'pos--3'],
      {
        '--first': ['123'],
        '--second': ['222'],
        '-a': [],
        '-b': [],
        '-c': ['test'],
      },
    ],
    [
      ['pos1', 'pos-2', 'pos--3', '--first', '123 456', '"123 456"', '-abc', `test "123 '456'" 'abc "def ghi"'`, '--second', '222'],
      ['pos1', 'pos-2', 'pos--3'],
      {
        '--first': ['123 456', '"123 456"'],
        '--second': ['222'],
        '-a': [],
        '-b': [],
        '-c': [`test "123 '456'" 'abc "def ghi"'`],
      },
    ],
  ];
}
