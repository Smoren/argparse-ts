import type {
  ArgConfig,
  ArgConfigExtended,
  ArgsParserInterface,
  ArgExtraConfig,
  ParsedArgumentsCollectionInterface
} from "./types";
import { ArgumentNameError } from "./exceptions";
import { parseArgsArray } from "./utils/utils";
import { convertToTable, formatArgHelp, tabTableRows } from "./utils/help";
import {
  checkAllPositionalValuesUsed,
  checkEnoughPositionalValues,
  createValueValidator,
  validateArgConfig
} from "./utils/validation";
import { createValueCaster } from "./utils/cast";

/**
 * A collection of parsed arguments.
 *
 * @category Classes
 */
export class ParsedArgumentsCollection implements ParsedArgumentsCollectionInterface {
  /**
   * A collection of parsed positional arguments.
   */
  private readonly positionalArgs: Record<string, unknown> = {};

  /**
   * A collection of parsed optional arguments.
   */
  private readonly optionArgs: Record<string, unknown> = {};

  /**
   * Returns all arguments as a record.
   */
  public get positional(): Record<string, unknown> {
    return { ...this.positionalArgs };
  }

  /**
   * Returns all arguments as a record.
   */
  public get options(): Record<string, unknown> {
    return { ...this.optionArgs };
  }

  /**
   * Adds a new argument to the collection.
   * @param name - The name of the argument.
   * @param value - The value of the argument.
   * @returns The instance of ParsedArgumentsCollection for chaining.
   */
  public add(name: string, value: unknown) {
    const formattedName = this.formatName(name);

    if (this.isPositional(name)) {
      this.positionalArgs[formattedName] = value;
    } else {
      this.optionArgs[formattedName] = value;
    }

    return this;
  }

  /**
   * Retrieves an argument value.
   * @param name - The name of the argument.
   * @returns The value of the argument, or undefined if not found.
   */
  public get<T = unknown>(name: string): T {
    const formattedName = this.formatName(name);

    if (this.isPositional(name)) {
      return (this.positional[formattedName] ?? undefined) as T;
    }

    return (this.optionArgs[formattedName] ?? undefined) as T;
  }

  /**
   * Checks if an argument exists in the collection.
   * @param name - The name of the argument.
   * @returns True if the argument exists, otherwise false.
   */
  public has(name: string): boolean {
    const formattedName = this.formatName(name);

    if (this.isPositional(name)) {
      return (this.positional[formattedName] ?? undefined) !== undefined;
    }

    return (this.optionArgs[formattedName] ?? undefined) !== undefined;
  }

  /**
   * Formats the argument name by removing leading dashes.
   * @param name - The argument name.
   * @returns The formatted name.
   */
  private formatName(name: string): string {
    return name.replace(/^--/, '');
  }

  /**
   * Checks if the argument is positional.
   * @param name - The argument name.
   * @returns True if the argument is positional, otherwise false.
   */
  private isPositional(name: string): boolean {
    return !name.startsWith('--');
  }
}

/**
 * Parser for command-line arguments.
 *
 * @category Classes
 *
 * @example
 * ```
 * const parser = new ArgsParser([
 *    {
 *        name: 'action',
 *        description: 'Action to perform',
 *        type: 'string',
 *    },
 *    {
 *        name: '--flag',
 *        description: 'Flag',
 *        alias: '-f',
 *        type: 'boolean',
 *        const: true,
 *        default: false,
 *    },
 *    {
 *        name: '--values',
 *        description: 'Values',
 *        alias: '-v',
 *        type: 'string',
 *        nargs: '*',
 *        default: [],
 *    }
 * ]);
 *
 * const argv = ['make', '--flag', '-v', 'a', 'b', 'c'];
 * const parsedArgs = parser.parse(argv);
 *
 * console.log(parsedArgs.positional); // { action: 'make' }
 * console.log(parsedArgs.optional); // { flag: true, values: ['a', 'b', 'c'] }
 * console.log(parsedArgs.get('--values')); // ['a', 'b', 'c']
 * ```
 */
export class ArgsParser implements ArgsParserInterface {
  /**
   * Maps argument names to their configuration.
   */
  private readonly argsMap: Map<string, ArgConfigExtended> = new Map();

  /**
   * Maps argument aliases to their corresponding names.
   */
  private readonly aliasMap: Map<string, string> = new Map();

  /**
   * Tracks used argument names and aliases to prevent duplicates.
   */
  private readonly usedArgs: Set<string> = new Set();

  /**
   * Constructs an instance of ArgsParser with the provided argument configurations.
   * @param args - An array of argument configurations.
   */
  constructor(args: ArgConfig[] = []) {
    for (const arg of args) {
      this.addArgument(arg);
    }
  }

  /**
   * Retrieves the help message.
   */
  public get help(): string {
    const positionalArgs = this.getPositionalArguments();
    const optionArgs = this.getOptionArguments();

    const positionalArgsRows = [];
    for (const arg of positionalArgs) {
      positionalArgsRows.push(...formatArgHelp(arg));
    }

    const optionalArgsRows = [];
    for (const arg of optionArgs) {
      optionalArgsRows.push(...formatArgHelp(arg));
    }

    const result = [];

    if (positionalArgsRows.length > 0) {
      result.push(
        ['Positional arguments:'],
        [''],
        ...tabTableRows(positionalArgsRows),
      );
    }

    if (optionalArgsRows.length > 0) {
      result.push(
        ['Options:'],
        [''],
        ...tabTableRows(optionalArgsRows),
      )
    }

    return convertToTable(result, 1);
  }

  /**
   * Adds the help message for the arguments to the parser.
   * @returns The updated parser.
   */
  public addHelp(): ArgsParser {
    return this.addArgument({
      name: '--help',
      alias: '-h',
      description: 'Show help',
      type: 'boolean',
      const: true,
      default: false,
    });
  }

  /**
   * Adds a new argument configuration to the parser.
   * @param config - The argument configuration.
   * @returns The instance of ArgsParser for chaining.
   *
   * @example
   * ```
   * const parser = new ArgsParser();
   * parser.addArgument({
   *   name: '--flag',
   *   alias: '-f',
   *   type: 'boolean',
   *   const: true,
   *   default: false,
   * });
   * ```
   */
  public addArgument(config: ArgConfig): ArgsParser {
    validateArgConfig(config, this.usedArgs);

    this.argsMap.set(config.name, this.extendArgConfig(config));
    this.usedArgs.add(config.name);

    if (config.alias !== undefined) {
      this.aliasMap.set(config.alias, config.name);
      this.usedArgs.add(config.alias);
    }

    return this;
  }

  /**
   * Parses the given argument string and returns a collection of parsed arguments.
   * @param argv - The argument string.
   * @returns A ParsedArgumentsCollection containing the parsed arguments.
   *
   * @example
   * ```
   * const parser = new ArgsParser([
   *    {
   *        name: 'action',
   *        description: 'Action to perform',
   *        type: 'string',
   *    },
   *    {
   *        name: '--flag',
   *        description: 'Flag',
   *        alias: '-f',
   *        type: 'boolean',
   *        const: true,
   *        default: false,
   *    },
   *    {
   *        name: '--values',
   *        description: 'Values',
   *        alias: '-v',
   *        type: 'string',
   *        nargs: '*',
   *        default: [],
   *    }
   * ]);
   *
   * const argv = ['make', '--flag', '-v', 'a', 'b', 'c'];
   * const parsedArgs = parser.parse(argv);
   *
   * console.log(parsedArgs.positional); // { action: 'make' }
   * console.log(parsedArgs.optional); // { flag: true, values: ['a', 'b', 'c'] }
   * console.log(parsedArgs.get('--values')); // ['a', 'b', 'c']
   * ```
   */
  public parse(argv: string[]) {
    const positionalArgs = this.getPositionalArguments();
    const optionalArgs = new Set(this.getOptionArguments());

    let [parsedPositional, parsedOptions] = parseArgsArray(argv);
    parsedPositional.reverse();

    const result = new ParsedArgumentsCollection();

    for (const argConfig of positionalArgs) {
      checkEnoughPositionalValues(parsedPositional, argConfig);

      const toReadCount = this.getArgsCountToRead(argConfig, parsedPositional.length);
      const value: string[] = [];
      for (let i=0; i<toReadCount; ++i) {
        value.push(parsedPositional.pop()!);
      }

      result.add(argConfig.name, this.processArgValue(value, argConfig, value.length > 0));
    }

    checkAllPositionalValuesUsed(parsedPositional);

    for (const [key, value] of Object.entries(parsedOptions)) {
      const argConfig = this.getArgConfig(key);

      result.add(argConfig.name, this.processArgValue(value, argConfig, true));
      optionalArgs.delete(argConfig);
    }

    for (const argConfig of optionalArgs) {
      result.add(argConfig.name, this.processArgValue([], argConfig, false));
    }

    return result;
  }

  private processArgValue(value: string[], argConfig: ArgConfigExtended, isset: boolean): unknown {
    const validator = createValueValidator(argConfig);
    const caster = createValueCaster(argConfig);

    validator.validateBeforeCast(value, isset);
    const result = caster.cast(value, isset);
    validator.validateAfterCast(result);

    return result;
  }

  private getArgsCountToRead(nargsConfig: ArgExtraConfig, totalCount: number): number {
    if (!nargsConfig.multiple) {
      return Math.min(1, totalCount);
    }

    if (nargsConfig.valuesCount !== undefined) {
      return Math.min(nargsConfig.valuesCount, totalCount);
    }

    return totalCount;
  }

  /**
   * Retrieves the argument configuration for a given key.
   * @param key - The argument key.
   * @returns The corresponding ArgConfigExtended.
   * @throws ArgumentNameError if the argument key is unknown.
   */
  private getArgConfig(key: string): ArgConfigExtended {
    const config = this.argsMap.get(this.aliasMap.get(key) ?? key);
    if (config === undefined) {
      throw new ArgumentNameError(`Unknown argument ${key}.`);
    }
    return config;
  }

  /**
   * Retrieves the positional arguments.
   * @returns An array of positional argument configurations.
   */
  private getPositionalArguments(): ArgConfigExtended[] {
    return [...this.argsMap.values()].filter((x) => x.positional);
  }

  /**
   * Retrieves the optional arguments.
   * @returns An array of optional argument configurations.
   */
  private getOptionArguments(): ArgConfigExtended[] {
    return [...this.argsMap.values()].filter((x) => !x.positional);
  }

  private extendArgConfig(config: ArgConfig): ArgConfigExtended {
    return { ...config, ...this.buildArgExtraConfig(config) };
  }

  private buildArgExtraConfig(config: ArgConfig): ArgExtraConfig {
    const positional = !config.name.startsWith('--');
    const multiple = config.nargs === '*' || config.nargs === '+' || typeof config.nargs === 'number';
    const required = config.required ?? (config.nargs !== '*' && config.nargs !== '?' && config.default === undefined);
    const allowEmpty = config.nargs === '*' || config.nargs === '?' || config.const !== undefined || (positional && !required);
    const valuesCount = typeof config.nargs === 'number' ? config.nargs : undefined;
    return { positional, multiple, required, allowEmpty, valuesCount };
  }
}
