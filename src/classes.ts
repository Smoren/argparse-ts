import type {
  ArgConfig,
  ArgConfigExtended,
  ArgsParserInterface,
  NArgsConfig,
  ParsedArgumentsCollectionInterface
} from "./types";
import { AddArgumentError, ArgumentNameError, ArgumentValueError } from "./exceptions";
import { buildNArgsConfig, castArgValue, parseArgsArray, validateArgValueAfterCast } from "./utils/utils";
import { convertToTable, formatArgHelp, tabTableRows } from "./utils/help";

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
  private readonly optionalArgs: Record<string, unknown> = {};

  /**
   * Returns all arguments as a record.
   */
  public get positional(): Record<string, unknown> {
    return { ...this.positionalArgs };
  }

  /**
   * Returns all arguments as a record.
   */
  public get optional(): Record<string, unknown> {
    return { ...this.optionalArgs };
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
      this.optionalArgs[formattedName] = value;
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

    return (this.optionalArgs[formattedName] ?? undefined) as T;
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

    return (this.optionalArgs[formattedName] ?? undefined) !== undefined;
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
    const optionalArgs = this.getOptionalArguments();

    const positionalArgsRows = [];
    for (const arg of positionalArgs) {
      positionalArgsRows.push(...formatArgHelp(arg));
    }

    const optionalArgsRows = [];
    for (const arg of optionalArgs) {
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
        ['Optional arguments:'],
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
    this.checkArgumentConfig(config);

    this.argsMap.set(config.name, { ...config, ...buildNArgsConfig(config) });
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
    const optionalArgs = new Set(this.getOptionalArguments());

    let [parsedPositional, parsedOptional] = parseArgsArray(argv);
    parsedPositional.reverse();

    const result = new ParsedArgumentsCollection();

    for (const argConfig of positionalArgs) {
      this.checkEnoughPositionalValues(parsedPositional, argConfig);

      const toReadCount = this.getArgsCountToRead(argConfig, parsedPositional.length);
      const value: string[] = [];
      for (let i=0; i<toReadCount; ++i) {
        if (parsedPositional.length === 0) {
          break;
        }
        value.push(parsedPositional.pop()!);
      }

      result.add(argConfig.name, castArgValue(value, argConfig, value.length > 0));
    }

    if (parsedPositional.length > 0) {
      throw new ArgumentValueError('Too many positional arguments.');
    }

    for (const [key, value] of Object.entries(parsedOptional)) {
      const argConfig = this.getArgConfig(key);

      result.add(argConfig.name, castArgValue(value, argConfig));
      optionalArgs.delete(argConfig);
    }

    for (const argConfig of optionalArgs) {
      result.add(argConfig.name, castArgValue([], argConfig, false));
    }

    return result;
  }

  /**
   * Checks the validity of an argument configuration.
   * @param config - The argument configuration.
   * @throws AddArgumentError if the configuration is invalid.
   */
  private checkArgumentConfig(config: ArgConfig) {
    if (config.name.startsWith('-') && !config.name.startsWith('--')) {
      throw new AddArgumentError(`Argument name ${config.name} is invalid.`);
    }

    if (config.alias !== undefined && (!config.alias.startsWith('-') || config.alias.startsWith('--'))) {
      throw new AddArgumentError(`Argument name ${config.name} is invalid.`);
    }

    if (this.usedArgs.has(config.name)) {
      throw new AddArgumentError(`Argument ${config.name} already exists.`);
    }

    if (config.alias !== undefined && this.usedArgs.has(config.alias)) {
      throw new AddArgumentError(`Argument ${config.alias} already exists.`);
    }
  }

  /**
   * Checks the number of positional arguments.
   * @param values - An array of positional argument values.
   * @param argConfig - The argument configuration.
   */
  private checkEnoughPositionalValues(values: string[], argConfig: ArgConfigExtended): void {
    const errorMessage = `Not enough positional arguments. ${argConfig.name} is required.`;

    if (!argConfig.multiple) {
      if (!argConfig.allowEmpty && values.length === 0) {
        throw new ArgumentValueError(errorMessage);
      }
      return;
    }

    if (!argConfig.allowEmpty && values.length === 0) {
      throw new ArgumentValueError(errorMessage);
    }

    if (!argConfig.allowEmpty && argConfig.count !== undefined && argConfig.count > values.length) {
      throw new ArgumentValueError(errorMessage);
    }
  }

  private getArgsCountToRead(nargsConfig: NArgsConfig, totalCount: number): number {
    if (!nargsConfig.multiple) {
      return 1;
    }

    if (nargsConfig.count !== undefined) {
      return nargsConfig.count;
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
    return [...this.argsMap.values()].filter((x) => !this.isOptional(x));
  }

  /**
   * Retrieves the optional arguments.
   * @returns An array of optional argument configurations.
   */
  private getOptionalArguments(): ArgConfigExtended[] {
    return [...this.argsMap.values()].filter((x) => this.isOptional(x));
  }

  /**
   * Checks if an argument is optional.
   * @param config - The argument configuration.
   * @returns True if the argument is optional, otherwise false.
   */
  private isOptional(config: ArgConfig): boolean {
    return config.name.startsWith('--');
  }
}
