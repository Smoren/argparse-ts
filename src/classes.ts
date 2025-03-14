import type {
  ArgConfig,
  ArgConfigExtended,
  ArgsParserInterface,
  ParsedArgumentsCollectionInterface,
} from "./types";
import { buildArgExtraConfig, parseArgsArray } from "./utils/utils";
import { convertToTable, formatArgHelp, tabTableRows } from "./utils/help";
import {
  checkAllOptionsRecognized,
  checkAllPositionalValuesUsed,
  checkEnoughPositionalValues,
  createValueValidator,
  validateArgConfig,
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
   * Returns positional arguments as a record.
   */
  public get positional(): Record<string, unknown> {
    return { ...this.positionalArgs };
  }

  /**
   * Returns options as a record.
   */
  public get options(): Record<string, unknown> {
    return { ...this.optionArgs };
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
   *
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
   *
   * @returns The updated parser.
   */
  public addHelp(): ArgsParser {
    return this.addArgument({
      name: '--help',
      alias: '-h',
      description: 'Show help',
      type: 'boolean',
      const: true,
    });
  }

  /**
   * Adds a new argument configuration to the parser.
   *
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
   *
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
  public parse(argv: string[]): ParsedArgumentsCollection {
    // Retrieve the positional argument configurations
    const positionalArgs = this.getPositionalArguments();

    // Retrieve the optional argument configurations and store them in a Set
    const optionalArgs = new Set(this.getOptionArguments());

    // Parse the input arguments array into positional and optional parts
    let [parsedPositional, parsedOptions] = parseArgsArray(argv);

    // TODO if help is provided, all args should be optional, maybe use actions.

    // Retrieve the optional argument configurations map
    const optionsConfigMap = this.getArgConfigMap(Object.keys(parsedOptions));

    // Reverse the parsed positional arguments for easier processing
    parsedPositional.reverse();

    // Initialize a new collection to store the parsed arguments with their values
    const result = new ParsedArgumentsCollection();

    // Process positional arguments
    for (let i=0; i<positionalArgs.length; ++i) {
      const argConfig = positionalArgs[i];

      // Get the remaining positional arguments configurations
      const remainingArgConfigs = positionalArgs.slice(i+1);

      // Check if there are enough positional arguments left
      checkEnoughPositionalValues(parsedPositional, argConfig, remainingArgConfigs);

      // Read the correct number of positional arguments
      const value = this.readPositionalArgValues(parsedPositional, argConfig, remainingArgConfigs);

      // Add the parsed argument to the result
      result.add(argConfig.name, this.processArgValue(value, argConfig, value.length > 0));
    }

    // Check if all positional arguments were used
    checkAllPositionalValuesUsed(parsedPositional);

    // Check if all options were recognized
    checkAllOptionsRecognized(parsedOptions, optionsConfigMap);

    // Process options
    for (const [key, value] of Object.entries(parsedOptions)) {
      const argConfig = optionsConfigMap[key]!;
      result.add(argConfig.name, this.processArgValue(value, argConfig, true));
      optionalArgs.delete(argConfig);
    }

    // Add default values for optional arguments that were not set
    for (const argConfig of optionalArgs) {
      result.add(argConfig.name, this.processArgValue([], argConfig, false));
    }

    return result;
  }

  /**
   * Processes a single argument value.
   *
   * @param value - The value(s) being processed.
   * @param argConfig - The configuration of the argument.
   * @param isset - Whether the argument is set.
   *
   * @returns The processed value, or undefined if the argument is not set.
   */
  private processArgValue(value: string[], argConfig: ArgConfigExtended, isset: boolean): unknown {
    const validator = createValueValidator(argConfig);
    const caster = createValueCaster(argConfig);

    validator.validateBeforeCast(value, isset);
    const result = caster.cast(value, isset);
    validator.validateAfterCast(result);

    return result;
  }

  /**
   * Retrieves the positional arguments.
   *
   * @returns An array of positional argument configurations.
   */
  private getPositionalArguments(): ArgConfigExtended[] {
    return [...this.argsMap.values()].filter((x) => x.positional);
  }

  /**
   * Retrieves the optional arguments.
   *
   * @returns An array of optional argument configurations.
   */
  private getOptionArguments(): ArgConfigExtended[] {
    return [...this.argsMap.values()].filter((x) => !x.positional);
  }

  /**
   * Retrieves a map of argument configurations for the given keys.
   *
   * @param keys - The keys to retrieve.
   *
   * @returns A map of argument configurations, where each key is one of the given keys and the value
   * is the corresponding ArgConfigExtended.
   */
  private getArgConfigMap(keys: string[]): Record<string, ArgConfigExtended | undefined> {
    const result: Record<string, ArgConfigExtended | undefined> = {};
    for (const key of keys) {
      result[key] = this.getArgConfig(key);
    }
    return result;
  }

  /**
   * Retrieves the argument configuration for a given key.
   *
   * @param key - The argument key.
   *
   * @returns The corresponding ArgConfigExtended.
   */
  private getArgConfig(key: string): ArgConfigExtended | undefined {
    return this.argsMap.get(this.aliasMap.get(key) ?? key);
  }

  /**
   * Extends an argument configuration with extra information.
   *
   * @param config - The argument configuration.
   *
   * @returns The argument configuration extended with extra information.
   */
  private extendArgConfig(config: ArgConfig): ArgConfigExtended {
    return { ...config, ...buildArgExtraConfig(config) };
  }

  /**
   * Reads the value of the positional argument based on the nargs configuration.
   *
   * @param parsedValues - The parsed positional arguments.
   * @param argConfig - The argument configuration.
   * @param remainingArgConfigs - The remaining argument configurations.
   *
   * @returns The value of the positional argument.
   */
  private readPositionalArgValues(
    parsedValues: string[],
    argConfig: ArgConfigExtended,
    remainingArgConfigs: ArgConfigExtended[],
  ): string[] {
    const toReadCount = this.getArgsCountToRead(argConfig, remainingArgConfigs, parsedValues);
    const value: string[] = [];
    for (let i=0; i<toReadCount; ++i) {
      value.push(parsedValues.pop()!);
    }
    return value;
  }

  /**
   * Determines the number of arguments to read based on the nargs configuration.
   *
   * @param argConfig - The configuration specifying how many arguments can be read.
   * @param remainingArgConfigs - The remaining arguments to read.
   * @param values - The total number of available arguments.
   *
   * @returns The number of arguments to read.
   */
  private getArgsCountToRead(argConfig: ArgConfigExtended, remainingArgConfigs: ArgConfigExtended[], values: string[]): number {
    // The total number of arguments that must be read by the remaining arguments.
    const minRemainingValuesCount = remainingArgConfigs.reduce((acc, x) => acc + x.minValuesCount, 0);

    // The maximum number of arguments that can be read for the current argument.
    let maxCurrentValuesCount = values.length - minRemainingValuesCount;
    if (maxCurrentValuesCount < 0) {
      // If there are not enough values to read, read as many as are available.
      maxCurrentValuesCount = Math.min(argConfig.minValuesCount, values.length);
    }

    // If the argument is not multiple, read only one value.
    if (!argConfig.multiple) {
      return Math.min(1, maxCurrentValuesCount);
    }

    // If the argument has a fixed number of values, read that many.
    if (argConfig.valuesCount !== undefined) {
      return Math.min(argConfig.valuesCount, maxCurrentValuesCount);
    }

    // Otherwise, read as many values as are available.
    return maxCurrentValuesCount;
  }
}
