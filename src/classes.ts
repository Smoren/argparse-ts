import {
  ActionConfig,
  ArgConfig,
  ArgConfigExtended,
  ArgParserConfig,
  ArgsParserInterface,
  ParsedArgumentsCollectionInterface, RouterAction, RouterInterface,
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
import { helpAction, versionAction } from "./utils/actions";
import {
  ArgsParserError,
  ArgsParserException,
  isExceptionInstanceOf,
  RouterStopException,
  StopException,
} from "./exceptions";

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
 */
export class ArgsParser implements ArgsParserInterface {
  /**
   * Configuration options for the parser.
   */
  public readonly config: ArgParserConfig;

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
   * @param config - Configuration options for the parser.
   * @param args - An array of argument configurations.
   */
  constructor(config: ArgParserConfig, args: ArgConfig[] = []) {
    this.config = this.formatConfig(config);
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
    validateArgConfig(config, this.getUsedArgs());

    this.argsMap.set(config.name, this.extendArgConfig(config));
    this.usedArgs.add(config.name);

    if (config.alias !== undefined) {
      this.aliasMap.set(config.alias, config.name);
      this.usedArgs.add(config.alias);
    }

    return this;
  }

  /**
   * Adds an action configuration to the parser.
   *
   * @param config - The action configuration.
   *
   * @returns The updated parser.
   */
  addAction(config: ActionConfig): ArgsParser {
    return this.addArgument({
      ...config,
      type: 'boolean',
      const: true,
    });
  }

  /**
   * Adds a help action to the parser.
   *
   * @param name - The name of the help action.
   * @param alias - The alias of the help action.
   *
   * @returns The updated parser.
   */
  addHelpAction(name?: string, alias?: string): ArgsParser {
    return this.addAction({
      name: name ?? '--help',
      alias: (name === undefined && alias === undefined) ? '-h' : alias,
      action: 'help',
      description: 'Show help and exit',
    });
  }

  /**
   * Adds a version action to the parser.
   *
   * @param name - The name of the version action.
   * @param alias - The alias of the version action.
   *
   * @returns The updated parser.
   */
  addVersionAction(name?: string, alias?: string): ArgsParser {
    return this.addAction({
      name: name ?? '--version',
      alias: (name === undefined && alias === undefined) ? '-v' : alias,
      action: 'version',
      description: 'Show version and exit',
    });
  }

  /**
   * Parses the given argument string and returns a collection of parsed arguments.
   *
   * @param argv - The argument string.
   *
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
    // Initialize a new collection to store the parsed arguments with their values
    const result = new ParsedArgumentsCollection();

    // Parse the input arguments array into positional and optional parts
    let [parsedPositional, parsedOptions] = parseArgsArray(argv);

    let error: ArgsParserError | undefined = undefined;

    try {
      this.processPositionalArgs(parsedPositional, this.getPositionalArguments(), result);
    } catch (e) {
      error = this.processException(e, error);
    }

    try {
      this.processOptions(parsedOptions, this.getOptionArguments(), result);
    } catch (e) {
      error = this.processException(e, error);
    }

    if (error) {
      this.processExit(1, error);
    }

    return result;
  }

  /**
   * Processes positional arguments.
   *
   * @param parsedValues - A parsed array of positional argument values.
   * @param argConfigs - An array of extended argument configurations.
   * @param result - The collection where parsed arguments will be added.
   *
   * @returns The number of positional arguments processed.
   */
  private processPositionalArgs(
    parsedValues: string[],
    argConfigs: ArgConfigExtended[],
    result: ParsedArgumentsCollection,
  ): number {
    let count = 0;

    // Reverse the parsed positional arguments for easier processing
    parsedValues = [...parsedValues].reverse();

    // Process positional arguments
    for (let i=0; i<argConfigs.length; ++i) {
      const argConfig = argConfigs[i];

      // Get the remaining positional arguments configurations
      const remainingArgConfigs = argConfigs.slice(i+1);

      // Check if there are enough positional arguments left
      checkEnoughPositionalValues(parsedValues, argConfig, remainingArgConfigs);

      // Read the correct number of positional arguments
      const value = this.readPositionalArgValues(parsedValues, argConfig, remainingArgConfigs);

      // Add the parsed argument to the result
      result.add(argConfig.name, this.processArgValue(value, argConfig, result, value.length > 0));

      ++count;
    }

    if (!this.config.ignoreUnrecognized) {
      // Check if all positional arguments were used
      checkAllPositionalValuesUsed(parsedValues);
    }

    return count;
  }

  /**
   * Processes optional arguments.
   *
   * @param parsedValuesMap - A map of parsed optional argument keys to their string values.
   * @param argConfigs - An array of extended argument configurations.
   * @param result - The collection where parsed arguments will be added.
   *
   * @returns The number of optional arguments processed.
   */
  private processOptions(
    parsedValuesMap: Record<string, string[]>,
    argConfigs: ArgConfigExtended[],
    result: ParsedArgumentsCollection,
  ): number {
    let count = 0;

    const argConfigsSet = new Set(argConfigs);

    // Retrieve the optional argument configurations map
    const argConfigsMap = this.getArgConfigMap(Object.keys(parsedValuesMap));

    if (!this.config.ignoreUnrecognized) {
      // Check if all options were recognized
      checkAllOptionsRecognized(parsedValuesMap, argConfigsMap);
    }

    // Process options
    for (const [key, value] of Object.entries(parsedValuesMap)) {
      if (argConfigsMap[key] === undefined) {
        continue;
      }

      const argConfig = argConfigsMap[key]!;
      result.add(argConfig.name, this.processArgValue(value, argConfig, result, true));
      argConfigsSet.delete(argConfig);
      ++count;
    }

    // Process optional arguments that were not set and add default if necessary
    for (const argConfig of argConfigsSet) {
      const value = this.processArgValue([], argConfig, result, false);
      if ('default' in argConfig) {
        result.add(argConfig.name, value);
      }
      ++count;
    }

    return count;
  }

  private processException(e: unknown, previous: ArgsParserError | undefined): ArgsParserError {
    if (isExceptionInstanceOf(e, StopException)) {
      this.processExit(0, e as StopException);
    }

    if (previous) {
      return previous;
    }

    if (isExceptionInstanceOf(e, ArgsParserError)) {
      return e as ArgsParserError;
    }

    throw e;
  }

  private processExit(exitCode: number, e: ArgsParserException) {
    if (process !== undefined) {
      if (exitCode === 0 && this.config.exitOnStop) {
        process.exit(exitCode);
      }
      if (exitCode !== 0 && this.config.exitOnError) {
        console.error(`Error: ${e.message}`);
        process.exit(exitCode);
      }
    }
    throw e;
  }

  /**
   * Processes a single argument value.
   *
   * @param value - The value(s) being processed.
   * @param argConfig - The configuration of the argument.
   * @param parsed - The parsed result
   * @param isset - Whether the argument is set.
   *
   * @returns The processed value, or undefined if the argument is not set.
   */
  private processArgValue(value: string[], argConfig: ArgConfigExtended, parsed: ParsedArgumentsCollection, isset: boolean): unknown {
    const validator = createValueValidator(argConfig);
    const caster = createValueCaster(argConfig);

    validator.validateBeforeCast(value, isset);
    let result = caster.cast(value, isset);
    validator.validateAfterCast(result);

    if (isset && argConfig.action !== undefined) {
      result = this.processAction(argConfig, parsed, result);
    }

    return result;
  }

  private processAction(config: ArgConfigExtended, parsed: ParsedArgumentsCollection, value: unknown): unknown {
    switch (true) {
      case config.action === 'help':
        return helpAction(value, parsed, this);
      case config.action === 'version':
        return versionAction(value, parsed, this);
      case (typeof config.action === 'function'):
        return config.action(value, parsed, this);
    }
    return value; // TODO maybe throw unknown action
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
   * Retrieves a set of used argument names and aliases.
   *
   * @returns A set of used argument names and aliases.
   */
  private getUsedArgs(): Set<string> {
    return new Set(this.usedArgs);
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
    // If the argument is required and not multiple, read one value.
    if (argConfig.required && !argConfig.multiple) {
      return Math.min(1, values.length);
    }

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

  private formatConfig(config: ArgParserConfig): ArgParserConfig {
    return {
      ...config,
      exitOnError: config.exitOnError ?? true,
      exitOnStop: config.exitOnStop ?? true,
      ignoreUnrecognized: config.ignoreUnrecognized ?? false,
    }
  }
}

/**
 * A class representing a router for command-line arguments.
 *
 * @category Classes
 * @category Router
 */
export class Router implements RouterInterface {
  private readonly routes: Record<string, RouterAction>;
  private readonly parser: ArgsParserInterface;

  /**
   * Creates a new Router instance.
   *
   * @param config - The configuration for the router.
   * @param routes - The routes for the router.
   */
  constructor(config: ArgParserConfig, routes: Record<string, RouterAction>) {
    this.routes = routes;
    this.parser = new ArgsParser({
      ...config,
      ignoreUnrecognized: true,
    });
    this.parser.addArgument({
      name: 'action',
      type: 'string',
      description: 'Action to run',
      choices: Object.keys(routes),
    });
    this.parser.addHelpAction();
    this.parser.addVersionAction();
  }

  /**
   * Runs the router.
   *
   * @param argv - The argument string.
   */
  run(argv?: string[]) {
    const passedArgv = argv ?? process.argv.slice(2);
    const parsed = this.parser.parse(passedArgv);
    const actionName = parsed.get<keyof typeof this.routes>('action');

    const actionArgsParser = new ArgsParser({
      name: `${this.parser.config.name} ${actionName}`,
    });

    this.routes[actionName](actionArgsParser, passedArgv.slice(1));
  }

  /**
   * Runs the router asynchronously.
   *
   * @param argv - The argument string.
   */
  async runAsync(argv?: string[]): Promise<void> {
    const passedArgv = argv ?? process.argv.slice(2);
    const parsed = this.parser.parse(passedArgv);
    const actionName = parsed.get<keyof typeof this.routes>('action');

    const actionArgsParser = new ArgsParser({
      name: `${this.parser.config.name} ${actionName}`,
    });

    await this.routes[actionName](actionArgsParser, passedArgv.slice(1));
  }
}
