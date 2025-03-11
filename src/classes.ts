import type { ArgConfig, ArgsParserInterface, NArgsConfig, ParsedArgumentsCollectionInterface } from "./types";
import { AddArgumentError, ArgumentNameError, ArgumentValueError } from "./exceptions";
import { buildNArgsConfig, castArgValue, validateCastedArgValue } from "./utils/utils";
import { parseArgsString } from "./utils/parse";
import { convertToTable, formatArgHelp, tabTableRows } from "./utils/help";

/**
 * A collection of parsed arguments.
 *
 * @category Classes
 */
export class ParsedArgumentsCollection implements ParsedArgumentsCollectionInterface {
  private readonly positionalArgs: Record<string, unknown> = {};
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
 */
export class ArgsParser implements ArgsParserInterface {
  private readonly argsMap: Map<string, ArgConfig> = new Map();
  private readonly aliasMap: Map<string, string> = new Map();
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
      const nargsConfig = buildNArgsConfig(arg.nargs);
      positionalArgsRows.push(...formatArgHelp(arg, nargsConfig));
    }

    const optionalArgsRows = [];
    for (const arg of optionalArgs) {
      const nargsConfig = buildNArgsConfig(arg.nargs);
      optionalArgsRows.push(...formatArgHelp(arg, nargsConfig));
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
   * Adds a new argument configuration to the parser.
   * @param config - The argument configuration.
   * @returns The instance of ArgsParser for chaining.
   */
  public addArgument(config: ArgConfig): ArgsParser {
    this.checkArgumentConfig(config);

    this.argsMap.set(config.name, config);
    this.usedArgs.add(config.name);

    if (config.alias !== undefined) {
      this.aliasMap.set(config.alias, config.name);
      this.usedArgs.add(config.alias);
    }

    return this;
  }

  /**
   * Parses the given argument string and returns a collection of parsed arguments.
   * @param argsString - The argument string.
   * @returns A ParsedArgumentsCollection containing the parsed arguments.
   * @throws ArgumentValueError if a required argument is missing or an argument value is invalid.
   */
  public parse(argsString: string) {
    const positionalArgs = this.getPositionalArguments();
    const optionalArgs = new Set(this.getOptionalArguments());

    const [parsedPositional, parsedOptional] = parseArgsString(argsString);
    parsedPositional.reverse();

    const result = new ParsedArgumentsCollection();

    for (const argConfig of positionalArgs) {
      const nargsConfig = buildNArgsConfig(argConfig.nargs);
      this.checkEnoughPositionalValues(parsedPositional, argConfig.name, nargsConfig);

      const value = nargsConfig.multiple
        ? parsedPositional.join(' ')
        : parsedPositional.pop() ?? '';

      const castedValue = castArgValue(value, argConfig, nargsConfig);
      result.add(argConfig.name, validateCastedArgValue(castedValue, argConfig, nargsConfig));
    }

    if (parsedPositional.length > 0) {
      throw new ArgumentValueError('Too many positional arguments.');
    }

    for (const [key, value] of Object.entries(parsedOptional)) {
      const argConfig = this.getArgConfig(key);
      const nargsConfig = buildNArgsConfig(argConfig.nargs);

      const castedValue = castArgValue(value, argConfig, nargsConfig);
      result.add(argConfig.name, validateCastedArgValue(castedValue, argConfig, nargsConfig));

      optionalArgs.delete(argConfig);
    }

    for (const argConfig of optionalArgs) {
      const nargsConfig = buildNArgsConfig(argConfig.nargs);
      const castedValue = castArgValue('', argConfig, nargsConfig);
      result.add(argConfig.name, validateCastedArgValue(castedValue, argConfig, nargsConfig));
    }

    return result;
  }

  /**
   * Checks the validity of an argument configuration.
   * @param config - The argument configuration.
   * @throws AddArgumentError if the configuration is invalid.
   */
  private checkArgumentConfig(config: ArgConfig) {
    if (this.usedArgs.has(config.name)) {
      throw new AddArgumentError(`Argument ${config.name} already exists.`);
    }

    if (config.alias !== undefined && this.usedArgs.has(config.alias)) {
      throw new AddArgumentError(`Argument ${config.alias} already exists.`);
    }
  }

  private checkEnoughPositionalValues(values: string[], argName: string, nargsConfig: NArgsConfig): void {
    const errorMessage = `Not enough positional arguments. ${argName} is required.`;

    if (!nargsConfig.multiple) {
      if (!nargsConfig.allowEmpty && values.length === 0) {
        throw new ArgumentValueError(errorMessage);
      }
      return;
    }

    if (!nargsConfig.allowEmpty && values.length === 0) {
      throw new ArgumentValueError(errorMessage);
    }

    if (!nargsConfig.allowEmpty && nargsConfig.count !== undefined && nargsConfig.count > values.length) {
      throw new ArgumentValueError(errorMessage);
    }
  }

  /**
   * Retrieves the argument configuration for a given key.
   * @param key - The argument key.
   * @returns The corresponding ArgConfig.
   * @throws ArgumentNameError if the argument key is unknown.
   */
  private getArgConfig(key: string): ArgConfig {
    const config = this.argsMap.get(this.aliasMap.get(key) ?? key);
    if (config === undefined) {
      throw new ArgumentNameError(`Unknown argument ${key}.`);
    }
    return config;
  }

  private getPositionalArguments(): ArgConfig[] {
    return [...this.argsMap.values()].filter((x) => !this.isOptional(x));
  }

  private getOptionalArguments(): ArgConfig[] {
    return [...this.argsMap.values()].filter((x) => this.isOptional(x));
  }

  private isOptional(config: ArgConfig): boolean {
    return config.name.startsWith('--');
  }
}
