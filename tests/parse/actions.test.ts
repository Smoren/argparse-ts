import { describe, expect, it } from "@jest/globals";
import { ArgConfig, ArgsParser } from "../../src";
// @ts-ignore
import { createConsoleLogSpy, createExitSpy, usingSpies } from "../utils";

describe.each([
  ...dataProviderWithEmptyArgsConfig(),
  ...dataProviderWithPositionalArgsConfig(),
  ...dataProviderWithOptionalArgsConfig(),
  ...dataProviderWithMixedArgsConfig(),
])(
  'Add Help Action Success Test',
  (config, actionConfig, argv) => {
    it('', () => {
      const parser = new ArgsParser({ name: 'Test' }, config);
      parser.addHelpAction(...actionConfig);
      usingSpies([createExitSpy, createConsoleLogSpy], (exitSpy, consoleLogSpy) => {
        expect(() => {
          const argsString: string[] = argv;
          parser.parse(argsString);
        }).toThrow();
        expect(exitSpy).toHaveBeenCalledWith(0);
        expect(consoleLogSpy).toHaveBeenCalledWith(parser.help);
      });
    });
  },
);

function dataProviderWithEmptyArgsConfig(): [ArgConfig[], string[], string[]][] {
  return [
    [
      [],
      [],
      ['--help'],
    ],
    [
      [],
      [],
      ['-h'],
    ],
    [
      [],
      ['--my-help'],
      ['--my-help'],
    ],
    [
      [],
      ['--help'],
      ['--help'],
    ],
    [
      [],
      ['--my-help', '-H'],
      ['--my-help'],
    ],
    [
      [],
      ['--my-help', '-H'],
      ['-H'],
    ],
  ];
}

function dataProviderWithPositionalArgsConfig(): [ArgConfig[], string[], string[]][] {
  return [
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }],
      [],
      ['--help'],
    ],
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }],
      [],
      ['-h'],
    ],
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }],
      ['--my-help'],
      ['--my-help'],
    ],
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }, {
        name: 'my-second-argument',
        type: 'number',
      }],
      ['--help'],
      ['--help'],
    ],
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }, {
        name: 'my-second-argument',
        type: 'number',
      }],
      ['--my-help', '-H'],
      ['--my-help'],
    ],
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }, {
        name: 'my-second-argument',
        type: 'number',
      }],
      ['--my-help', '-H'],
      ['-H'],
    ],
  ];
}

function dataProviderWithOptionalArgsConfig(): [ArgConfig[], string[], string[]][] {
  return [
    [
      [{
        name: '--my-first-argument',
        type: 'string',
        required: false,
      }],
      [],
      ['--help'],
    ],
    [
      [{
        name: '--my-first-argument',
        type: 'string',
        required: true,
      }],
      [],
      ['-h'],
    ],
    [
      [{
        name: '--my-first-argument',
        type: 'string',
        nargs: '+',
      }],
      ['--my-help'],
      ['--my-help'],
    ],
    [
      [{
        name: '--my-first-argument',
        type: 'string',
        required: false,
      }, {
        name: '--my-second-argument',
        type: 'string',
        required: true,
      }],
      ['--help'],
      ['--help'],
    ],
    [
      [{
        name: '--my-first-argument',
        type: 'string',
        nargs: '*',
      }, {
        name: '--my-seconf-argument',
        type: 'string',
        nargs: '+',
      }],
      ['--my-help', '-H'],
      ['--my-help'],
    ],
    [
      [{
        name: '--my-first-argument',
        type: 'string',
        nargs: '?',
        required: true,
      }, {
        name: '--my-seconf-argument',
        type: 'string',
        nargs: '+',
      }],
      ['--my-help', '-H'],
      ['-H'],
    ],
  ];
}

function dataProviderWithMixedArgsConfig(): [ArgConfig[], string[], string[]][] {
  return [
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }, {
        name: '--my-first-argument',
        type: 'string',
        required: false,
      }],
      [],
      ['--help'],
    ],
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }, {
        name: '--my-first-argument',
        type: 'string',
        required: true,
      }],
      [],
      ['-h'],
    ],
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }, {
        name: '--my-first-argument',
        type: 'string',
        nargs: '+',
      }],
      ['--my-help'],
      ['--my-help'],
    ],
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }, {
        name: '--my-first-argument',
        type: 'string',
        required: false,
      }, {
        name: '--my-second-argument',
        type: 'string',
        required: true,
      }],
      ['--help'],
      ['--help'],
    ],
    [
      [{
        name: 'my-first-argument',
        type: 'string',
        nargs: '?',
      }, {
        name: '--my-first-argument',
        type: 'string',
        nargs: '*',
      }, {
        name: '--my-seconf-argument',
        type: 'string',
        nargs: '+',
      }],
      ['--my-help', '-H'],
      ['--my-help'],
    ],
    [
      [{
        name: 'my-first-argument',
        type: 'string',
      }, {
        name: 'my-second-argument',
        type: 'number',
        nargs: '*',
      }, {
        name: '--my-first-argument',
        type: 'string',
        nargs: '?',
        required: true,
      }, {
        name: '--my-seconf-argument',
        type: 'string',
        nargs: '+',
      }],
      ['--my-help', '-H'],
      ['-H'],
    ],
  ];
}
