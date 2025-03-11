import { describe, expect, it } from "@jest/globals";
import { parseArgsString } from "../../src/utils/parse";

describe.each([
  ...dataProvider(),
])(
  'Parse String Test',
  (argsString, expectedPositional, expectedOptional) => {
    it('', () => {
      const [positional, optional] = parseArgsString(argsString);
      expect(positional).toEqual(expectedPositional);
      expect(optional).toEqual(expectedOptional);
    });
  },
);

function dataProvider(): [string, string[], Record<string, string>][] {
  return [
    [
      '',
      [],
      {},
    ],
    [
      'a',
      ['a'],
      {},
    ],
    [
      'aaa',
      ['aaa'],
      {},
    ],
    [
      'aaa bbb ccc',
      ['aaa', 'bbb', 'ccc'],
      {},
    ],
    [
      '-a',
      [],
      {
        '-a': '',
      },
    ],
    [
      '-a -b',
      [],
      {
        '-a': '',
        '-b': '',
      },
    ],
    [
      '-ab',
      [],
      {
        '-a': '',
        '-b': '',
      },
    ],
    [
      '-abc',
      [],
      {
        '-a': '',
        '-b': '',
        '-c': '',
      },
    ],
    [
      '-a -bc',
      [],
      {
        '-a': '',
        '-b': '',
        '-c': '',
      },
    ],
    [
      '-a 1 -b 2 -c 3',
      [],
      {
        '-a': '1',
        '-b': '2',
        '-c': '3',
      },
    ],
    [
      '-a -b 2 -c 3',
      [],
      {
        '-a': '',
        '-b': '2',
        '-c': '3',
      },
    ],
    [
      '--first -b 2 -c 3',
      [],
      {
        '--first': '',
        '-b': '2',
        '-c': '3',
      },
    ],
    [
      '--first 123 -b 2 -c',
      [],
      {
        '--first': '123',
        '-b': '2',
        '-c': '',
      },
    ],
    [
      '--first 123 -abc --second 222',
      [],
      {
        '--first': '123',
        '--second': '222',
        '-a': '',
        '-b': '',
        '-c': '',
      },
    ],
    [
      '--first 123 -abc test --second 222',
      [],
      {
        '--first': '123',
        '--second': '222',
        '-a': '',
        '-b': '',
        '-c': 'test',
      },
    ],
    [
      'pos1 --first 123 -abc test --second 222',
      ['pos1'],
      {
        '--first': '123',
        '--second': '222',
        '-a': '',
        '-b': '',
        '-c': 'test',
      },
    ],
    [
      'pos1 pos-2 pos--3 --first 123 -abc test --second 222',
      ['pos1', 'pos-2', 'pos--3'],
      {
        '--first': '123',
        '--second': '222',
        '-a': '',
        '-b': '',
        '-c': 'test',
      },
    ],
  ];
}
