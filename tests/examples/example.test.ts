import { it, expect } from "@jest/globals";
import { ArgsParser } from "../../src";

it('Example Test', async () => {
  const parser = new ArgsParser([
    {
      name: 'container',
      description: "Container name",
      type: 'string',
    },
    {
      name: 'operations',
      description: "Operations to run",
      type: 'string',
      nargs: '+',
      choices: ['build', 'clear', 'sync', 'start', 'stop'],
    },
    {
      name: '--mode',
      description: "Run mode",
      type: 'string',
      nargs: '?',
      choices: ['dev', 'test', 'prod'],
      default: 'prod',
    },
    {
      name: '--cpu',
      description: "CPU cores count to use",
      type: 'number',
      nargs: '?',
      default: 1,
    },
    {
      name: '--use-gpu',
      description: "Use GPU flag",
      type: 'boolean',
      const: true,
      default: false,
    },
    {
      name: '--extra-services',
      alias: '-e',
      description: "Extra services to include",
      type: 'string',
      nargs: '*',
    },
  ]);

  parser.addHelp();

  console.log(parser.help);

  const argv = ['main', 'clear', 'build', 'start', 'sync', '--mode', 'dev', '--use-gpu', '-e', 'logger', 'profiler', 'tester'];
  const parsedArgs = parser.parse(argv);

  expect(parsedArgs.positional).toEqual({
    'container': 'main',
    'operations': ['clear', 'build', 'start', 'sync'],
  });

  expect(parsedArgs.options).toEqual({
    'mode': 'dev',
    'cpu': 1,
    'use-gpu': true,
    'extra-services': ['logger', 'profiler', 'tester'],
  });

  const containerName = parsedArgs.get<string>('container');
  expect(containerName).toEqual('main');

  const operations = parsedArgs.get<string[]>('operations');
  expect(operations).toEqual(['clear', 'build', 'start', 'sync']);

  const mode = parsedArgs.get<string>('--mode');
  expect(mode).toEqual('dev');

  const cpuCount = parsedArgs.get<number>('--cpu');
  expect(cpuCount).toEqual(1);

  const useGpu = parsedArgs.get<boolean>('--use-gpu');
  expect(useGpu).toEqual(true);
});

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
      alias: '-f',
      description: "My first optional argument",
      type: 'string',
      nargs: '?',
      choices: ['test', 'dev', 'prod'],
      validator: (x: unknown) => String(x).length > 2,
    },
    {
      name: '--optional-second',
      alias: '-s',
      description: "My second optional argument",
      type: 'boolean',
      const: false,
    },
    {
      name: '--optional-third',
      alias: '-t',
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

  const argv = ['dev', '123', '--optional-first', 'test', '-s', '--optional-third', '1', '2', '3', '--optional-const'];
  const parsedArgs = parser.parse(argv);

  expect(parsedArgs.positional).toEqual({
    'positional-first': 'dev',
    'positional-second': 123,
  });

  expect(parsedArgs.options).toEqual({
    'optional-first': 'test',
    'optional-second': false,
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
    expect(value).toEqual(false);
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

  const argv = ['-s', '-f', '0'];
  const parsedArgs = parser.parse(argv);

  console.log(parsedArgs.options);
});

it('Third Test', async () => {
  const parser = new ArgsParser([
    {
      name: '--value',
      alias: '-v',
      type: 'string',
    },
  ]);

  const argv = ['-v', ''];
  const parsedArgs = parser.parse(argv);

  console.log(parsedArgs.options);
});

it('Forth Test', async () => {
  const parser = new ArgsParser([
    {
      name: '--value',
      alias: '-v',
      type: 'number',
      nargs: '?',
    },
  ]);

  const argv = ['-v'];
  const parsedArgs = parser.parse(argv);

  console.log(parsedArgs.options);
});

it('Fifth Test', async () => {
  const parser = new ArgsParser([
    {
      name: '--value',
      alias: '-v',
      type: 'string',
      nargs: '*',
    },
  ]);

  const argsString = [`-v`, `"123  'abc'  123"`, `567`, `"89"`];
  const parsedArgs = parser.parse(argsString);

  console.log(parsedArgs.options);
});

it('Sixth Test', async () => {
  const parser = new ArgsParser([
    {
      name: '--my-first-argument',
      type: 'string',
      nargs: '*',
    },
  ]);

  const argsString: string[] = [];
  const parsedArgs = parser.parse(argsString);

  console.log(parsedArgs.options);
});

it('Seventh Test', async () => {
  const parser = new ArgsParser([
    {
      name: '--my-first-argument',
      type: 'string',
      default: 'test',
      const: 'const test',
    },
  ]);

  const argsString: string[] = ['--my-first-argument']; // must throw exception
  const parsedArgs = parser.parse(argsString);

  console.log(parsedArgs.options);
});
