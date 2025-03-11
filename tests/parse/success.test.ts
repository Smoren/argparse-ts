import { describe, expect, it } from "@jest/globals";
import { ArgConfig, ArgsParser } from "../../src";

describe.each([
  ...dataProviderForEmptyString(),
  ...dataProviderForNamedSingleArguments(),
  ...dataProviderForNamedSingleSeveralArguments(),
  ...dataProviderForAliasedSingleArguments(),
  ...dataProviderForAliasedSingleSeveralArguments(),
  ...dataProviderForNamedMultipleArguments(),
  ...dataProviderForAliasedMultipleArguments(),
  ...dataProviderForValidatedArguments(),
])(
  'Success Test',
  (config, argsString, expected) => {
    it('', () => {
      const parser = new ArgsParser(config);
      const parsedArgs = parser.parse(argsString);
      expect(parsedArgs.optional).toEqual(expected);
    });
  },
);

function dataProviderForEmptyString(): [ArgConfig[], string, Record<string, unknown>][] {
  return [
    [
      [],
      '',
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
      '',
      {
        'my-first-argument': 'test',
      },
    ],
    [
      [
        {
          name: '--my-test-argument',
          type: 'number',
          required: true,
          default: 123,
        },
        {
          name: '--my-another-argument',
          type: 'boolean',
          default: true,
        },
      ],
      '',
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
      '',
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
      '',
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
      '',
      {
        'my-first-argument': undefined,
      },
    ],
  ];
}

function dataProviderForNamedSingleArguments(): [ArgConfig[], string, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
        },
      ],
      '--my-first-argument',
      {
        'my-first-argument': '',
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'string',
        },
      ],
      '--my-first-argument value',
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
        },
      ],
      '--my-first-argument value',
      {
        'my-first-argument': 'value',
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
        },
      ],
      '--my-first-argument',
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
          default: true,
        },
      ],
      '--my-first-argument',
      {
        'my-first-argument': true,
      },
    ],
    [
      [
        {
          name: '--my-first-argument',
          type: 'boolean',
          default: false,
        },
      ],
      '--my-first-argument',
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
      '--my-first-argument 0',
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
      '--my-first-argument false',
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
      '--my-first-argument 1',
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
      '--my-first-argument asd',
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
      '--my-first-argument 0',
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
      '--my-first-argument 0',
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
      '--my-first-argument asd',
      {
        'my-first-argument': NaN,
      },
    ],
  ];
}

function dataProviderForNamedSingleSeveralArguments(): [ArgConfig[], string, Record<string, unknown>][] {
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
      '--my-first-argument first --my-second-argument 2',
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
          required: true,
          type: 'number',
        },
      ],
      '--my-first-argument first --my-second-argument 2',
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
          required: true,
          type: 'number',
        },
      ],
      '--my-second-argument 2',
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
      '--my-second-argument 2',
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
      '--my-first-argument nya',
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
      '',
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
          default: 'test',
        },
        {
          name: '--my-second-argument',
          type: 'number',
          default: 123,
        },
      ],
      '--my-first-argument --my-second-argument',
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
        },
        {
          name: '--my-second-argument',
          type: 'number',
        },
      ],
      '--my-first-argument --my-second-argument',
      {
        'my-first-argument': '',
        'my-second-argument': 0,
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
      '--my-string-argument str --my-number-argument 22 --my-boolean-argument',
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
      '--my-string-argument str --my-number-argument 22 --my-boolean-argument false',
      {
        'my-string-argument': 'str',
        'my-number-argument': 22,
        'my-boolean-argument': false,
      },
    ],
  ];
}

function dataProviderForAliasedSingleArguments(): [ArgConfig[], string, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
        },
      ],
      '-f',
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
      '-f value',
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
      '-f value',
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
        },
      ],
      '-f',
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
          default: true,
        },
      ],
      '-f',
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
          default: false,
        },
      ],
      '-f',
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
      '-f 0',
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
      '-f false',
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
      '-f 1',
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
      '-f asd',
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
          required: true,
        },
      ],
      '-f 0',
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
      '-f 0',
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
      '-f asd',
      {
        'my-first-argument': NaN,
      },
    ],
  ];
}

function dataProviderForAliasedSingleSeveralArguments(): [ArgConfig[], string, Record<string, unknown>][] {
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
      '-f first -s 2',
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
          required: true,
          type: 'number',
        },
      ],
      '-s 2 -f first',
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
          required: true,
          type: 'number',
        },
      ],
      '-s 2',
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
      '-s 2',
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
      '-f nya',
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
      '',
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
      '-f -s',
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
        },
        {
          name: '--my-second-argument',
          alias: '-s',
          type: 'number',
        },
      ],
      '-fs',
      {
        'my-first-argument': '',
        'my-second-argument': 0,
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
      '-s str -n 22 -b',
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
        },
      ],
      '-s str -b -n 22',
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
      '-s str -n 22',
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
      '-s str -n 22',
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
      '-s str -n 22 -b false',
      {
        'my-string-argument': 'str',
        'my-number-argument': 22,
        'my-boolean-argument': false,
      },
    ],
  ];
}

function dataProviderForNamedMultipleArguments(): [ArgConfig[], string, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          multiple: true,
        },
      ],
      '--my-first-argument',
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
          multiple: true,
        },
      ],
      '--my-first-argument',
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
          multiple: true,
        },
      ],
      '--my-first-argument',
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
          multiple: true,
          default: [],
        },
      ],
      '--my-first-argument',
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
          multiple: true,
          default: [],
        },
      ],
      '--my-first-argument',
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
          multiple: true,
          default: [],
        },
      ],
      '--my-first-argument',
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
          multiple: true,
          default: ['a', 'b', 'c'],
        },
      ],
      '--my-first-argument',
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
          multiple: true,
          default: [1, 2, 3],
        },
      ],
      '--my-first-argument',
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
          multiple: true,
          default: [true, false],
        },
      ],
      '--my-first-argument',
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
          multiple: true,
        },
      ],
      '--my-first-argument a',
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
          multiple: true,
        },
      ],
      '--my-first-argument asd',
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
          multiple: true,
        },
      ],
      '--my-first-argument 1 2 3',
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
          multiple: true,
        },
      ],
      '--my-first-argument 11 22 33',
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
          multiple: true,
        },
      ],
      '--my-first-argument 1 2 3',
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
          multiple: true,
        },
      ],
      '--my-first-argument 11 22 33',
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
          multiple: true,
        },
      ],
      '--my-first-argument 0 1 0',
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
          multiple: true,
        },
      ],
      '--my-first-argument true 0 false 1 a',
      {
        'my-first-argument': [true, false, false, true, true],
      },
    ],
  ];
}

function dataProviderForAliasedMultipleArguments(): [ArgConfig[], string, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          multiple: true,
        },
      ],
      '-f',
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
          multiple: true,
        },
      ],
      '-f',
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
          multiple: true,
        },
      ],
      '-f',
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
          multiple: true,
          default: [],
        },
      ],
      '-f',
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
          multiple: true,
          default: [],
        },
      ],
      '-f',
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
          multiple: true,
          default: [],
        },
      ],
      '-f',
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
          multiple: true,
          default: ['a', 'b', 'c'],
        },
      ],
      '-f',
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
          multiple: true,
          default: [1, 2, 3],
        },
      ],
      '-f',
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
          multiple: true,
          default: [true, false],
        },
      ],
      '-f',
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
          multiple: true,
        },
      ],
      '-f a',
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
          multiple: true,
        },
      ],
      '-f asd',
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
          multiple: true,
        },
      ],
      '-f 1 2 3',
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
          multiple: true,
        },
      ],
      '-f 11 22 33',
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
          multiple: true,
        },
      ],
      '-f 1 2 3',
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
          multiple: true,
        },
      ],
      '-f 11 22 33',
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
          multiple: true,
        },
      ],
      '-f 0 1 0',
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
          multiple: true,
        },
      ],
      '-f true 0 false 1 a',
      {
        'my-first-argument': [true, false, false, true, true],
      },
    ],
  ];
}

function dataProviderForValidatedArguments(): [ArgConfig[], string, Record<string, unknown>][] {
  return [
    [
      [
        {
          name: '--my-first-argument',
          alias: '-f',
          type: 'string',
          validator: (x) => String(x).length > 2,
        },
      ],
      '--my-first-argument 123',
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
      '--my-first-argument 3',
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
      '--my-first-argument 3',
      {
        'my-first-argument': true,
      },
    ],
  ];
}
