import { describe, expect, it } from "@jest/globals";
import { ArgConfig, ArgsParser } from "../../src";

describe.each([
  ...dataProviderForEmptyArgv(),
  ...dataProviderForSingleOptionals(),
  ...dataProviderForSingleSeveralOptionals(),
  ...dataProviderForAliasedSingleOptionals(),
  ...dataProviderForAliasedSingleSeveralOptionals(),
  ...dataProviderForMultipleOptionals(),
  ...dataProviderForAliasedMultipleOptionals(),
  ...dataProviderForValidatedArguments(),
])(
  'Success Test',
  (config, argv, expectedPositional, expectedOptional) => {
    it('', () => {
      const parser = new ArgsParser(config);
      const parsedArgs = parser.parse(argv);
      expect(parsedArgs.positional).toEqual(expectedPositional);
      expect(parsedArgs.options).toEqual(expectedOptional);
    });
  },
);

function dataProviderForEmptyArgv(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [],
      [],
      {},
      {},
    ],
    [
      [
        {
          name: 'my-first-argument',
          type: 'string',
          default: 'test',
          nargs: '?',
        },
      ],
      [],
      {
        'my-first-argument': 'test',
      },
      {},
    ],
    [
      [
        {
          name: 'my-first-argument',
          type: 'string',
          default: ['test'],
          nargs: '*',
        },
      ],
      [],
      {
        'my-first-argument': ['test'],
      },
      {},
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          default: 'test',
        },
      ],
      [],
      {},
      {
        'my-first-argument': 'test',
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          const: 'test',
        },
      ],
      [],
      {},
      {
        'my-first-argument': undefined,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          nargs: '*',
        },
      ],
      [],
      {},
      {
        'my-first-argument': undefined,
      },
    ],
    [
      [
        {
          name: 'my-first-positional-argument',
          type: 'string',
          default: 'default',
        },
        {
          name: '--my-first-argument',
          type: 'string',
          default: 'default',
          const: 'const',
        },
      ],
      [],
      {
        'my-first-positional-argument': 'default',
      },
      {
        'my-first-argument': 'default',
      },
    ],
    [
      [
        {
          name: '--my-test-argument',
          type: 'number',
          default: 123,
        },
        {
          name: '--my-another-argument',
          type: 'boolean',
          default: true,
        },
      ],
      [],
      {},
      {
        'my-test-argument': 123,
        'my-another-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
        },
      ],
      [],
      {},
      {
        'my-first-argument': undefined,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'number',
        },
      ],
      [],
      {},
      {
        'my-first-argument': undefined,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
        },
      ],
      [],
      {},
      {
        'my-first-argument': undefined,
      },
    ],
  ];
}

function dataProviderForSingleOptionals(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: '?',
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': undefined,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          const: 'value',
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': 'value',
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
        },
      ],
      ['--my-first-argument', 'value'],
      {},
      {
        'my-first-argument': 'value',
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          default: 'test',
          const: 'test const'
        },
      ],
      ['--my-first-argument', 'value'],
      {},
      {
        'my-first-argument': 'value',
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
          nargs: '?',
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': undefined,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
          const: true,
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
          nargs: '?',
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': undefined,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
          const: true,
          default: false,
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
          const: false,
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': false,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
          default: true,
          const: true,
        },
      ],
      ['--my-first-argument', '0'],
      {},
      {
        'my-first-argument': false,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
        },
      ],
      ['--my-first-argument', 'false'],
      {},
      {
        'my-first-argument': false,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
          default: false,
          const: false,
        },
      ],
      ['--my-first-argument', '1'],
      {},
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
        },
      ],
      ['--my-first-argument', 'asd'],
      {},
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'number',
        },
      ],
      ['--my-first-argument', '0'],
      {},
      {
        'my-first-argument': 0,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'number',
          default: 1,
        },
      ],
      ['--my-first-argument', '0'],
      {},
      {
        'my-first-argument': 0,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'number',
        },
      ],
      ['--my-first-argument', 'asd'],
      {},
      {
        'my-first-argument': NaN,
      },
    ],
  ];
}

function dataProviderForSingleSeveralOptionals(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
        },
        {
          name: '--my-second-argument',
          type: 'number',
        },
      ],
      ['--my-first-argument', 'first', '--my-second-argument', '2'],
      {},
      {
        'my-first-argument': 'first',
        'my-second-argument': 2,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          type: 'number',
        },
      ],
      ['--my-first-argument', 'first', '--my-second-argument', '2'],
      {},
      {
        'my-first-argument': 'first',
        'my-second-argument': 2,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          type: 'number',
        },
      ],
      ['--my-second-argument', '2'],
      {},
      {
        'my-first-argument': 'test',
        'my-second-argument': 2,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          type: 'number',
          default: 123,
        },
      ],
      ['--my-second-argument', '2'],
      {},
      {
        'my-first-argument': 'test',
        'my-second-argument': 2,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          type: 'number',
          default: 123,
        },
      ],
      ['--my-first-argument', 'nya'],
      {},
      {
        'my-first-argument': 'nya',
        'my-second-argument': 123,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          type: 'number',
          default: 123,
        },
      ],
      [],
      {},
      {
        'my-first-argument': 'test',
        'my-second-argument': 123,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          const: 'test',
          default: 'default',
        },
        {
          name: '--my-second-argument',
          type: 'number',
          const: 123,
          default: -1,
        },
      ],
      ['--my-first-argument', '--my-second-argument'],
      {},
      {
        'my-first-argument': 'test',
        'my-second-argument': 123,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          nargs: '?',
        },
        {
          name: '--my-second-argument',
          type: 'number',
          nargs: '?',
        },
      ],
      ['--my-first-argument', '--my-second-argument'],
      {},
      {
        'my-first-argument': undefined,
        'my-second-argument': undefined,
      },
    ],
    [
      [
        {
          name: '--my-string-argument',
          type: 'string',
        },
        {
          name: '--my-number-argument',
          type: 'number',
        },
        {
          name: '--my-boolean-argument',
          type: 'boolean',
          const: true,
        },
      ],
      ['--my-string-argument', 'str', '--my-number-argument', '22', '--my-boolean-argument'],
      {},
      {
        'my-string-argument': 'str',
        'my-number-argument': 22,
        'my-boolean-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-string-argument',
          type: 'string',
        },
        {
          name: '--my-number-argument',
          type: 'number',
        },
        {
          name: '--my-boolean-argument',
          type: 'boolean',
        },
      ],
      ['--my-string-argument', 'str', '--my-number-argument', '22', '--my-boolean-argument', 'false'],
      {},
      {
        'my-string-argument': 'str',
        'my-number-argument': 22,
        'my-boolean-argument': false,
      },
    ],
  ];
}

function dataProviderForAliasedSingleOptionals(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
        },
      ],
      ['-f', ''],
      {},
      {
        'my-first-argument': '',
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
        },
      ],
      ['-f', 'value'],
      {},
      {
        'my-first-argument': 'value',
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          default: 'test',
        },
      ],
      ['-f', 'value'],
      {},
      {
        'my-first-argument': 'value',
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          const: true,
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          const: true,
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          const: true,
          default: false,
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
        },
      ],
      ['-f', '0'],
      {},
      {
        'my-first-argument': false,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
        },
      ],
      ['-f', 'false'],
      {},
      {
        'my-first-argument': false,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
        },
      ],
      ['-f', '1'],
      {},
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
        },
      ],
      ['-f', 'asd'],
      {},
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
        },
      ],
      ['-f', '0'],
      {},
      {
        'my-first-argument': 0,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          default: 1,
        },
      ],
      ['-f', '0'],
      {},
      {
        'my-first-argument': 0,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
        },
      ],
      ['-f', 'asd'],
      {},
      {
        'my-first-argument': NaN,
      },
    ],
  ];
}

function dataProviderForAliasedSingleSeveralOptionals(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
        },
        {
          name: '--my-second-argument',
          alias: '-s',
          type: 'number',
        },
      ],
      ['-f', 'first', '-s', '2'],
      {},
      {
        'my-first-argument': 'first',
        'my-second-argument': 2,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          alias: '-s',
          type: 'number',
        },
      ],
      ['-s', '2', '-f', 'first'],
      {},
      {
        'my-first-argument': 'first',
        'my-second-argument': 2,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          alias: '-s',
          type: 'number',
        },
      ],
      ['-s', '2'],
      {},
      {
        'my-first-argument': 'test',
        'my-second-argument': 2,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          alias: '-s',
          type: 'number',
          default: 123,
        },
      ],
      ['-s', '2'],
      {},
      {
        'my-first-argument': 'test',
        'my-second-argument': 2,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          alias: '-s',
          type: 'number',
          default: 123,
        },
      ],
      ['-f', 'nya'],
      {},
      {
        'my-first-argument': 'nya',
        'my-second-argument': 123,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          alias: '-s',
          type: 'number',
          default: 123,
        },
      ],
      [],
      {},
      {
        'my-first-argument': 'test',
        'my-second-argument': 123,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          default: 'test',
        },
        {
          name: '--my-second-argument',
          alias: '-s',
          type: 'number',
          default: 123,
        },
      ],
      ['-f', '-s'],
      {},
      {
        'my-first-argument': undefined,
        'my-second-argument': undefined,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          const: 'test',
        },
        {
          name: '--my-second-argument',
          alias: '-s',
          type: 'number',
          const: 22,
        },
      ],
      ['-fs'],
      {},
      {
        'my-first-argument': 'test',
        'my-second-argument': 22,
      },
    ],
    [
      [
        {
          name: '--my-string-argument',
          alias: '-s',
          type: 'string',
        },
        {
          name: '--my-number-argument',
          alias: '-n',
          type: 'number',
        },
        {
          name: '--my-boolean-argument',
          alias: '-b',
          type: 'boolean',
          const: true,
        },
      ],
      ['-s', 'str', '-n', '22', '-b'],
      {},
      {
        'my-string-argument': 'str',
        'my-number-argument': 22,
        'my-boolean-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-string-argument',
          alias: '-s',
          type: 'string',
        },
        {
          name: '--my-number-argument',
          alias: '-n',
          type: 'number',
        },
        {
          name: '--my-boolean-argument',
          alias: '-b',
          type: 'boolean',
          const: true,
        },
      ],
      ['-s', 'str', '-b', '-n', '22'],
      {},
      {
        'my-string-argument': 'str',
        'my-number-argument': 22,
        'my-boolean-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-string-argument',
          alias: '-s',
          type: 'string',
        },
        {
          name: '--my-number-argument',
          alias: '-n',
          type: 'number',
        },
        {
          name: '--my-boolean-argument',
          alias: '-b',
          type: 'boolean',
          default: false,
        },
      ],
      ['-s', 'str', '-n', '22'],
      {},
      {
        'my-string-argument': 'str',
        'my-number-argument': 22,
        'my-boolean-argument': false,
      },
    ],
    [
      [
        {
          name: '--my-string-argument',
          alias: '-s',
          type: 'string',
        },
        {
          name: '--my-number-argument',
          alias: '-n',
          type: 'number',
        },
        {
          name: '--my-boolean-argument',
          alias: '-b',
          type: 'boolean',
        },
      ],
      ['-s', 'str', '-n', '22'],
      {},
      {
        'my-string-argument': 'str',
        'my-number-argument': 22,
      },
    ],
    [
      [
        {
          name: '--my-string-argument',
          alias: '-s',
          type: 'string',
        },
        {
          name: '--my-number-argument',
          alias: '-n',
          type: 'number',
        },
        {
          name: '--my-boolean-argument',
          alias: '-b',
          type: 'boolean',
        },
      ],
      ['-s', 'str', '-n', '22', '-b', 'false'],
      {},
      {
        'my-string-argument': 'str',
        'my-number-argument': 22,
        'my-boolean-argument': false,
      },
    ],
  ];
}

function dataProviderForMultipleOptionals(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: '*',
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          nargs: '*',
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          nargs: '*',
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: '*',
          default: [],
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          nargs: '*',
          default: [],
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          nargs: '*',
          const: [],
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: '*',
          const: ['a', 'b', 'c'],
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': ['a', 'b', 'c'],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          nargs: '+',
          const: [1, 2, 3],
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': [1, 2, 3],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          nargs: '*',
          const: [true, false],
          default: [],
        },
      ],
      ['--my-first-argument'],
      {},
      {
        'my-first-argument': [true, false],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: 1,
        },
      ],
      ['--my-first-argument', 'a'],
      {},
      {
        'my-first-argument': ['a'],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: 1,
        },
      ],
      ['--my-first-argument', 'asd'],
      {},
      {
        'my-first-argument': ['asd'],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: 3,
        },
      ],
      ['--my-first-argument', '1', '2', '3'],
      {},
      {
        'my-first-argument': ['1', '2', '3'],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: '+',
        },
      ],
      ['--my-first-argument', '11', '22', '33'],
      {},
      {
        'my-first-argument': ['11', '22', '33'],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          nargs: 3,
        },
      ],
      ['--my-first-argument', '1', '2', '3'],
      {},
      {
        'my-first-argument': [1, 2, 3],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          nargs: '*',
        },
      ],
      ['--my-first-argument', '11', '22', '33'],
      {},
      {
        'my-first-argument': [11, 22, 33],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          nargs: '*',
        },
      ],
      ['--my-first-argument', '0', '1', '0'],
      {},
      {
        'my-first-argument': [false, true, false],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          nargs: 5,
        },
      ],
      ['--my-first-argument', 'true', '0', 'false', '1', 'a'],
      {},
      {
        'my-first-argument': [true, false, false, true, true],
      },
    ],
  ];
}

function dataProviderForAliasedMultipleOptionals(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: '*',
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          nargs: '*',
          default: [],
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: '*',
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          nargs: '*',
          default: [],
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          nargs: '*',
          const: [],
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': [],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: '+',
          const: ['a', 'b', 'c'],
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': ['a', 'b', 'c'],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          nargs: '*',
          const: [1, 2, 3],
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': [1, 2, 3],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          nargs: '*',
          const: [true, false],
        },
      ],
      ['-f'],
      {},
      {
        'my-first-argument': [true, false],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: '*',
        },
      ],
      ['-f', 'a'],
      {},
      {
        'my-first-argument': ['a'],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: 1,
        },
      ],
      ['-f', 'asd'],
      {},
      {
        'my-first-argument': ['asd'],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: 3,
        },
      ],
      ['-f', '1', '2', '3'],
      {},
      {
        'my-first-argument': ['1', '2', '3'],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          nargs: '*',
        },
      ],
      ['-f', '11', '22', '33'],
      {},
      {
        'my-first-argument': ['11', '22', '33'],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          nargs: '+',
        },
      ],
      ['-f', '1', '2', '3'],
      {},
      {
        'my-first-argument': [1, 2, 3],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          nargs: '*',
        },
      ],
      ['-f', '11', '22', '33'],
      {},
      {
        'my-first-argument': [11, 22, 33],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          nargs: 3,
        },
      ],
      ['-f', '0', '1', '0'],
      {},
      {
        'my-first-argument': [false, true, false],
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          nargs: '*',
        },
      ],
      ['-f', 'true', '0', 'false', '1', 'a'],
      {},
      {
        'my-first-argument': [true, false, false, true, true],
      },
    ],
  ];
}

function dataProviderForValidatedArguments(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: 'my-first-argument',
          type: 'string',
          validator: (x) => String(x).length > 2,
        },
      ],
      ['123'],
      {
        'my-first-argument': '123',
      },
      {},
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          validator: (x) => String(x).length > 2,
        },
      ],
      ['--my-first-argument', '123'],
      {},
      {
        'my-first-argument': '123',
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'number',
          validator: (x) => Number(x) > 2,
        },
      ],
      ['--my-first-argument', '3'],
      {},
      {
        'my-first-argument': 3,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'boolean',
          validator: (x) => Boolean(x),
        },
      ],
      ['--my-first-argument', '3'],
      {},
      {
        'my-first-argument': true,
      },
    ],
  ];
}
