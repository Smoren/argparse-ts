import { it, expect } from "@jest/globals";
import { ArgsParser } from "../../src";
// @ts-ignore
import { createConsoleErrorSpy, createConsoleLogSpy, createExitSpy, usingSpies } from "../utils";

it('Example Test', async () => {
  const parser = new ArgsParser({
    name: 'Test',
  }, [
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
  const parser = new ArgsParser({
    name: 'Test',
  }, [
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
  const parser = new ArgsParser({
    name: 'Test',
  }, [
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
  const parser = new ArgsParser({
    name: 'Test',
  }, [
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
  const parser = new ArgsParser({
    name: 'Test',
  }, [
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
  const parser = new ArgsParser({
    name: 'Test',
  }, [
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
  const parser = new ArgsParser({
    name: 'Test',
    version: '1.0.0',
  });
  parser.addArgument({ name: 'my-first-argument', type: 'string' });
  parser.addHelpAction();
  parser.addVersionAction();

  usingSpies([createExitSpy, createConsoleLogSpy], (exitSpy, consoleLogSpy) => {
    expect(() => {
      const argsString: string[] = ['--help'];
      parser.parse(argsString);
    }).toThrow();
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(consoleLogSpy).toHaveBeenCalledWith(parser.help);
  });

  usingSpies([createExitSpy, createConsoleLogSpy], (exitSpy, consoleLogSpy) => {
    expect(() => {
      const argsString: string[] = ['-h'];
      parser.parse(argsString);
    }).toThrow();
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(consoleLogSpy).toHaveBeenCalledWith(parser.help);
  });

  usingSpies([createExitSpy, createConsoleLogSpy], (exitSpy, consoleLogSpy) => {
    expect(() => {
      const argsString: string[] = ['--version'];
      parser.parse(argsString);
    }).toThrow();
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(consoleLogSpy).toHaveBeenCalledWith('1.0.0');
  });

  usingSpies([createExitSpy, createConsoleLogSpy], (exitSpy, consoleLogSpy) => {
    expect(() => {
      const argsString: string[] = ['-v'];
      parser.parse(argsString);
    }).toThrow();
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(consoleLogSpy).toHaveBeenCalledWith('1.0.0');
  });

  usingSpies([createExitSpy, createConsoleErrorSpy], (exitSpy, consoleErrorSpy) => {
    expect(() => {
      const argsString: string[] = ['-h123'];
      parser.parse(argsString);
    }).toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: The following arguments are required: my-first-argument');
  });
});

it('Seventh Test', async () => {
  const parser = new ArgsParser({
    name: 'Test',
  }, [
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

it('Eighth Test', async () => {
  const parser = new ArgsParser({
    name: 'Test',
    version: '1.0.0',
  });
  parser.addArgument({ name: '--array', type: 'number', nargs: 3 });
  parser.addHelpAction();
  parser.addVersionAction();

  usingSpies([createExitSpy, createConsoleErrorSpy], (exitSpy, consoleErrorSpy) => {
    expect(() => {
      const argsString: string[] = ['--array'];
      parser.parse(argsString);
    }).toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error: Argument --array expects 3 values, but 0 given`);
  });

  usingSpies([createExitSpy, createConsoleErrorSpy], (exitSpy, consoleErrorSpy) => {
    expect(() => {
      const argsString: string[] = ['--array', '1'];
      parser.parse(argsString);
    }).toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error: Argument --array expects 3 values, but 1 given`);
  });

  usingSpies([createExitSpy, createConsoleErrorSpy], (exitSpy, consoleErrorSpy) => {
    expect(() => {
      const argsString: string[] = ['--array', '1', '2'];
      parser.parse(argsString);
    }).toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error: Argument --array expects 3 values, but 2 given`);
  });

  usingSpies([createExitSpy, createConsoleErrorSpy], (exitSpy, consoleErrorSpy) => {
    expect(() => {
      const argsString: string[] = ['--array', '1', '2', '3', '4'];
      parser.parse(argsString);
    }).toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error: Argument --array expects 3 values, but 4 given`);
  });

  {
    const argsString: string[] = ['--array', '1', '2', '3'];
    const result = parser.parse(argsString);
    expect(result.get<number[]>('--array')).toEqual([1, 2, 3]);
  }
});

it('Tenth Test', async () => {
  const parser = new ArgsParser({
    name: 'Test',
  });
  parser.addHelpAction();
  parser.addVersionAction();

  const parsedArgs = parser.parse([]);

  console.log(parsedArgs.options);
});

it('Eleventh Test', async () => {
  const parser = new ArgsParser({
    name: 'Test',
    ignoreUnrecognized: true,
  }, [
    {
      name: 'positional-first',
      description: "My first positional argument",
      type: 'string',
      choices: ['test', 'dev', 'prod'],
    },
    {
      name: '--optional-first',
      alias: '-f',
      description: "My first optional argument",
      type: 'string',
      nargs: '?',
      choices: ['test', 'dev', 'prod'],
      validator: (x: unknown) => String(x).length > 2,
      required: true,
    }
  ]);

  const argv = ['dev', 'other', 'another', '--optional-first', 'test', '--optional-other', '123', '--optional-another'];
  const parsedArgs = parser.parse(argv);

  expect(parsedArgs.positional).toEqual({
    'positional-first': 'dev',
  });

  expect(parsedArgs.options).toEqual({
    'optional-first': 'test',
  });
});
