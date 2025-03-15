import { describe, expect, it } from "@jest/globals";
import { ArgConfig, ArgsParser } from "../../src";

describe.each([
  ...dataProviderForEmptyArgv(),
  ...dataProviderForPositional(),
  ...dataProviderForSingleOptions(),
  ...dataProviderForSingleSeveralOptions(),
  ...dataProviderForAliasedSingleOptions(),
  ...dataProviderForAliasedSingleSeveralOptions(),
  ...dataProviderForMultipleOptions(),
  ...dataProviderForAliasedMultipleOptions(),
  ...dataProviderForValidatedArguments(),
  ...dataProviderForAll(),
])(
  'Success Test',
  (config, argv, expectedPositional, expectedOptional) => {
    it('', () => {
      const parser = new ArgsParser(config);
      const parsedArgs = parser.parse(argv);
      expect(parsedArgs.positional).toEqual(expectedPositional);
      expect(parsedArgs.options).toEqual(expectedOptional);

      for (const name of Object.keys(expectedPositional)) {
        if (expectedPositional[name] === undefined) {
          expect(parsedArgs.has(name)).toBe(false);
        } else {
          expect(parsedArgs.has(name)).toBe(true);
        }
        expect(parsedArgs.get<string>(name)).toEqual(expectedPositional[name]);
      }

      for (const name of Object.keys(expectedOptional)) {
        if (expectedOptional[name] === undefined) {
          expect(parsedArgs.has(`--${name}`)).toBe(false);
        } else {
          expect(parsedArgs.has(`--${name}`)).toBe(true);
        }
        expect(parsedArgs.get<string>(`--${name}`)).toEqual(expectedOptional[name]);
      }
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
          nargs: '?',
        },
      ],
      [],
      {},
      {
        'my-first-argument': undefined,
      },
    ], [
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
          required: false,
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
          required: false,
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
          nargs: '?',
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
          required: false,
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

function dataProviderForPositional(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: 'first',
          type: 'string',
          nargs: '?',
        },
      ],
      [],
      {},
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'string',
        },
      ],
      [''],
      {
        first: '',
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'string',
        },
      ],
      ['test'],
      {
        first: 'test',
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'string',
        },
      ],
      ['-1'],
      {
        first: '-1',
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
        },
      ],
      ['-1'],
      {
        first: -1,
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'string',
          default: 1,
        },
      ],
      [],
      {
        first: 1,
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
          default: [1],
        },
      ],
      [],
      {
        first: [1],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
          default: [1],
        },
      ],
      ['3'],
      {
        first: [3],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
          default: [1],
        },
      ],
      ['3', '4', '5'],
      {
        first: [3, 4, 5],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'second',
          type: 'string',
          nargs: '*',
        },
      ],
      [],
      {
        first: undefined,
        second: [],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'second',
          type: 'string',
          nargs: '*',
        },
      ],
      ['1'],
      {
        first: 1,
        second: [],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'second',
          type: 'string',
          nargs: '*',
        },
      ],
      ['1', 's1', 's2'],
      {
        first: 1,
        second: ['s1', 's2'],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
        },
        {
          name: 'second',
          type: 'string',
          nargs: '*',
        },
      ],
      ['1', '2', '3'],
      {
        first: [1, 2, 3],
        second: [],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: 'third',
          type: 'string',
          nargs: '?',
        },
      ],
      ['1', '2', '3'],
      {
        first: 1,
        second: ['2', '3'],
        third: undefined,
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: 'third',
          type: 'string',
          nargs: '?',
        },
      ],
      ['1', '2', '3', '4'],
      {
        first: 1,
        second: ['2', '3'],
        third: '4',
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: 1,
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: 'third',
          type: 'string',
          nargs: '?',
        },
      ],
      ['1', '2', '3', '4'],
      {
        first: [1],
        second: ['2', '3'],
        third: '4',
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
        },
        {
          name: 'second',
          type: 'string',
          nargs: '?',
        },
      ],
      ['1', '2'],
      {
        first: [1, 2],
        second: undefined,
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
        },
        {
          name: 'second',
          type: 'string',
        },
      ],
      ['1', '2', '3'],
      {
        first: [1, 2],
        second: '3',
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '+',
        },
        {
          name: 'second',
          type: 'string',
        },
      ],
      ['1', '2', '3'],
      {
        first: [1, 2],
        second: '3',
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
      ],
      ['1', '2'],
      {
        first: [],
        second: ['1', '2'],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
      ],
      ['1', '2', '3'],
      {
        first: [1],
        second: ['2', '3'],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
      ],
      ['1', '2', '3', '4'],
      {
        first: [1, 2],
        second: ['3', '4'],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: 'third',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'forth',
          type: 'string',
          nargs: 1,
        },
        {
          name: 'fifth',
          type: 'number',
          nargs: '+',
        },
        {
          name: 'sixth',
          type: 'string',
        },
        {
          name: 'seventh',
          type: 'number',
          nargs: '+',
        },
      ],
      ['1', '2', '3', '4', '5', '6'],
      {
        first: undefined,
        second: ['1', '2'],
        third: undefined,
        forth: ['3'],
        fifth: [4],
        sixth: '5',
        seventh: [6],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: 'third',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'forth',
          type: 'string',
          nargs: 1,
        },
        {
          name: 'fifth',
          type: 'number',
          nargs: '+',
        },
        {
          name: 'sixth',
          type: 'string',
        },
        {
          name: 'seventh',
          type: 'number',
          nargs: '+',
        },
      ],
      ['1', '2', '3', '4', '5', '6', '7'],
      {
        first: 1,
        second: ['2', '3'],
        third: undefined,
        forth: ['4'],
        fifth: [5],
        sixth: '6',
        seventh: [7],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: 'third',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'forth',
          type: 'string',
          nargs: 1,
        },
        {
          name: 'fifth',
          type: 'number',
          nargs: '+',
        },
        {
          name: 'sixth',
          type: 'string',
        },
        {
          name: 'seventh',
          type: 'number',
          nargs: '+',
        },
      ],
      ['1', '2', '3', '4', '5', '6', '7', '8'],
      {
        first: 1,
        second: ['2', '3'],
        third: 4,
        forth: ['5'],
        fifth: [6],
        sixth: '7',
        seventh: [8],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: 'third',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'forth',
          type: 'string',
          nargs: 1,
        },
        {
          name: 'fifth',
          type: 'number',
          nargs: '+',
        },
        {
          name: 'sixth',
          type: 'string',
        },
        {
          name: 'seventh',
          type: 'number',
          nargs: '+',
        },
      ],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      {
        first: 1,
        second: ['2', '3'],
        third: 4,
        forth: ['5'],
        fifth: [6, 7],
        sixth: '8',
        seventh: [9],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: 'third',
          type: 'number',
          nargs: '?',
        },
        {
          name: 'forth',
          type: 'string',
          nargs: 1,
        },
        {
          name: 'fifth',
          type: 'number',
          nargs: '+',
        },
        {
          name: 'sixth',
          type: 'string',
        },
        {
          name: 'seventh',
          type: 'number',
          nargs: '+',
        },
      ],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      {
        first: 1,
        second: ['2', '3'],
        third: 4,
        forth: ['5'],
        fifth: [6, 7, 8],
        sixth: '9',
        seventh: [10],
      },
      {},
    ],
  ];
}

function dataProviderForSingleOptions(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
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
          type: 'number',
          required: true,
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
          required: true,
        },
      ],
      ['--my-first-argument', '-1'],
      {},
      {
        'my-first-argument': -1,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          required: true,
        },
      ],
      ['--my-first-argument', '-1'],
      {},
      {
        'my-first-argument': '-1',
      },
    ],
  ];
}

function dataProviderForSingleSeveralOptions(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
          required: true,
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
      ['--my-string-argument', '-1', '--my-number-argument', '-1', '--my-boolean-argument', 'false'],
      {},
      {
        'my-string-argument': '-1',
        'my-number-argument': -1,
        'my-boolean-argument': false,
      },
    ],
  ];
}

function dataProviderForAliasedSingleOptions(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
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
  ];
}

function dataProviderForAliasedSingleSeveralOptions(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
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
          nargs: '?',
        },
        {
          name: '--my-second-argument',
          alias: '-s',
          type: 'number',
          default: 123,
          nargs: '?',
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
          required: false,
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

function dataProviderForMultipleOptions(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
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
      ['--my-first-argument', 'true', '0', 'false', '1', 'TRUE'],
      {},
      {
        'my-first-argument': [true, false, false, true, true],
      },
    ],
  ];
}

function dataProviderForAliasedMultipleOptions(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
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
      ['-f', 'true', '0', 'false', '1', 'TRUE'],
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
      ['--my-first-argument', '1'],
      {},
      {
        'my-first-argument': true,
      },
    ],
  ];
}

function dataProviderForAll(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: '--third',
          type: 'number',
        },
      ],
      ['1', '2'],
      {
        first: [],
        second: ['1', '2'],
      },
      {},
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: '--third',
          type: 'number',
        },
      ],
      ['1', '2', '--third', '3'],
      {
        first: [],
        second: ['1', '2'],
      },
      {
        third: 3,
      },
    ],
    [
      [
        {
          name: 'first',
          type: 'number',
          nargs: '*',
        },
        {
          name: 'second',
          type: 'string',
          nargs: 2,
        },
        {
          name: '--third',
          type: 'number',
        },
      ],
      ['-1', '-2', '--third', '-3'],
      {
        first: [],
        second: ['-1', '-2'],
      },
      {
        third: -3,
      },
    ],
  ];
}
