import { describe, expect, it } from "@jest/globals";
import { ActionConfig, ArgConfig, ArgsParser } from "../../src";
// @ts-ignore
import { createConsoleErrorSpy, createConsoleLogSpy, createExitSpy, usingSpies } from "../utils";

describe.each([
  ...dataProviderForHelpWithEmptyArgsConfig(),
  ...dataProviderForHelpWithPositionalArgsConfig(),
  ...dataProviderForHelpWithOptionalArgsConfig(),
  ...dataProviderForHelpWithMixedArgsConfig(),
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

describe.each([
  ...dataProviderForHelpError(),
])(
  'Add Help Action Error Test',
  (config, actionConfig, argv) => {
    it('', () => {
      const parser = new ArgsParser({ name: 'Test' }, config);
      parser.addHelpAction(...actionConfig);
      usingSpies([createExitSpy, createConsoleErrorSpy], (exitSpy, consoleErrorSpy) => {
        expect(() => {
          const argsString: string[] = argv;
          parser.parse(argsString);
        }).toThrow();
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(`Error: Unrecognized options: ${argv.join(', ')}.`);
      });
    });
  },
);

describe.each([
  ...dataProviderForVersionWithEmptyArgsConfig(),
  ...dataProviderForVersionWithMixedArgsConfig(),
])(
  'Add Version Action Success Test',
  (config, actionConfig, argv) => {
    it('', () => {
      const parser = new ArgsParser({ name: 'Test', version: '1.0.0' }, config);
      parser.addVersionAction(...actionConfig);
      usingSpies([createExitSpy, createConsoleLogSpy], (exitSpy, consoleLogSpy) => {
        expect(() => {
          const argsString: string[] = argv;
          parser.parse(argsString);
        }).toThrow();
        expect(exitSpy).toHaveBeenCalledWith(0);
        expect(consoleLogSpy).toHaveBeenCalledWith('1.0.0');
      });
    });
  },
);

describe.each([
  ...dataProviderForVersionError(),
])(
  'Add Version Action Error Test',
  (config, actionConfig, argv) => {
    it('', () => {
      const parser = new ArgsParser({ name: 'Test', version: '1.0.0' }, config);
      parser.addVersionAction(...actionConfig);
      usingSpies([createExitSpy, createConsoleErrorSpy], (exitSpy, consoleErrorSpy) => {
        expect(() => {
          const argsString: string[] = argv;
          parser.parse(argsString);
        }).toThrow();
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(`Error: Unrecognized options: ${argv.join(', ')}.`);
      });
    });
  },
);

describe.each([
  ...dataProviderForArgConfigCustomAction(),
])(
  'Add ArgConfig Custom Action Success Test',
  (config, argv, expectedPositional, expectedOptional) => {
    it('', () => {
      const parser = new ArgsParser({ name: 'Test' }, config);
      const parsedArgs = parser.parse(argv);
      expect(parsedArgs.positional).toEqual(expectedPositional);
      expect(parsedArgs.options).toEqual(expectedOptional);
    });
  },
);

function dataProviderForHelpWithEmptyArgsConfig(): [ArgConfig[], string[], string[]][] {
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

function dataProviderForHelpWithPositionalArgsConfig(): [ArgConfig[], string[], string[]][] {
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

function dataProviderForHelpWithOptionalArgsConfig(): [ArgConfig[], string[], string[]][] {
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

function dataProviderForHelpWithMixedArgsConfig(): [ArgConfig[], string[], string[]][] {
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

function dataProviderForHelpError(): [ArgConfig[], string[], string[]][] {
  return [
    [
      [],
      ['--my-help'],
      ['--help'],
    ],
    [
      [],
      ['--my-help'],
      ['-h'],
    ],
    [
      [],
      ['--help'],
      ['-h'],
    ],
    [
      [],
      ['--help', '-H'],
      ['-h'],
    ],
    [
      [{
        name: '--my-first-argument',
        type: 'string',
        required: true,
      }],
      ['--help', '-H'],
      ['-h'],
    ],
  ];
}

function dataProviderForVersionWithEmptyArgsConfig(): [ArgConfig[], string[], string[]][] {
  return [
    [
      [],
      [],
      ['--version'],
    ],
    [
      [],
      [],
      ['-v'],
    ],
    [
      [],
      ['--my-version'],
      ['--my-version'],
    ],
    [
      [],
      ['--version'],
      ['--version'],
    ],
    [
      [],
      ['--my-version', '-V'],
      ['--my-version'],
    ],
    [
      [],
      ['--my-version', '-V'],
      ['-V'],
    ],
  ];
}

function dataProviderForVersionWithMixedArgsConfig(): [ArgConfig[], string[], string[]][] {
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
      ['--version'],
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
      ['-v'],
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
      ['--my-version'],
      ['--my-version'],
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
      ['--version'],
      ['--version'],
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
      ['--my-version', '-V'],
      ['--my-version'],
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
      ['--my-version', '-V'],
      ['-V'],
    ],
  ];
}

function dataProviderForVersionError(): [ArgConfig[], string[], string[]][] {
  return [
    [
      [],
      ['--my-version'],
      ['--version'],
    ],
    [
      [],
      ['--my-version'],
      ['-v'],
    ],
    [
      [],
      ['--version'],
      ['-v'],
    ],
    [
      [],
      ['--version', '-V'],
      ['-v'],
    ],
    [
      [{
        name: '--my-first-argument',
        type: 'string',
        required: true,
      }],
      ['--version', '-V'],
      ['-v'],
    ],
  ];
}

function dataProviderForArgConfigCustomAction(): [ArgConfig[], string[], Record<string, unknown>, Record<string, unknown>][] {
  return [
    [
      [{
        name: 'positional-argument',
        type: 'string',
        action: (v) => `[${String(v)}]`,
      }],
      ['value'],
      {
        'positional-argument': '[value]',
      },
      {},
    ],
    [
      [{
        name: '--option-argument',
        type: 'string',
        action: (v) => `[${String(v)}]`,
      }],
      ['--option-argument', 'value'],
      {},
      {
        'option-argument': '[value]',
      },
    ],
    [
      [{
        name: '--option-argument',
        alias: '-o',
        type: 'string',
        action: (v) => `[${String(v)}]`,
      }],
      ['-o', 'value'],
      {},
      {
        'option-argument': '[value]',
      },
    ],
    [
      [{
        name: 'positional',
        type: 'number',
      }, {
        name: '--option',
        alias: '-o',
        type: 'number',
      }, {
        name: '--action',
        type: 'number',
        default: 1,
        action: (value, parsed) => {
          return Number(value) + Number(parsed.get('positional')) + Number(parsed.get('--option'));
        },
      }],
      ['10', '--option', '5', '--action', '3'],
      {
        'positional': 10,
      },
      {
        'option': 5,
        'action': 18,
      },
    ],
  ];
}
