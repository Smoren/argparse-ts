import { it, expect } from "@jest/globals";
import { ArgsParser } from "../../src";

it('First Test', async () => {
  const parser = new ArgsParser([
    {
      name: 'positional-first',
      description: "My first positional argument",
      type: 'string',
      choices: ['test', 'dev', 'prod'],
    },
    {
      name: 'positional-second',
      description: "My first positional argument",
      type: 'number',
    },
    {
      name: '--optional-first',
      alias: '-1',
      description: "My first optional argument",
      type: 'string',
      nargs: '?',
      choices: ['test', 'dev', 'prod'],
      validator: (x: unknown) => String(x).length > 2,
    },
    {
      name: '--optional-second',
      alias: '-2',
      description: "My second optional argument",
      type: 'boolean',
      default: false,
    },
    {
      name: '--optional-third',
      alias: '-3',
      description: "My third optional argument",
      type: 'number',
      nargs: '*',
      default: [0, 1],
    },
    {
      name: '--optional-const',
      alias: '-c',
      description: "My const optional argument",
      type: 'boolean',
      const: true,
      default: false,
    },
  ]);

  console.log(parser.help);

  const argsString = 'dev 123 --optional-first test -2 --optional-third 1 2 3 --optional-const';
  const parsedArgs = parser.parse(argsString);

  expect(parsedArgs.positional).toEqual({
    'positional-first': 'dev',
    'positional-second': 123,
  });

  expect(parsedArgs.optional).toEqual({
    'optional-first': 'test',
    'optional-second': true,
    'optional-third': [1, 2, 3],
    'optional-const': true,
  });

  {
    const value = parsedArgs.get<string>('positional-first');
    expect(value).toEqual('dev');
  }
  {
    const value = parsedArgs.get<string>('positional-second');
    expect(value).toEqual(123);
  }
  {
    const value = parsedArgs.get<string | undefined>('--optional-first');
    expect(value).toEqual('test');
  }
  {
    const value = parsedArgs.get<boolean>('--optional-second');
    expect(value).toEqual(true);
  }
  {
    const value = parsedArgs.get<number[]>('--optional-third');
    expect(value).toEqual([1, 2, 3]);
  }
  {
    const value = parsedArgs.get<boolean>('--optional-const');
    expect(value).toEqual(true);
  }
});

it('Second Test', async () => {
  const parser = new ArgsParser([
    {
      name: '--flag',
      alias: '-f',
      type: 'boolean',
      const: true,
      default: false,
    },
    {
      name: '--string',
      alias: '-s',
      type: 'string',
      const: 'const value',
    },
  ]);

  const argsString = '-s -f 0';
  const parsedArgs = parser.parse(argsString);

  console.log(parsedArgs.optional);
});
