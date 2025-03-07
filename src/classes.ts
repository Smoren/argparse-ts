import type { ArgConfig, ArgsParserInterface, FormattedArgConfig, ParsedArgumentsCollectionInterface } from "./types";
import { AddArgumentError, ArgumentNameError, ArgumentValueError } from "./exceptions";
import { castArgValue, parseArgsString } from "./utils";

/**
 * A collection of parsed arguments.
 */
export class ParsedArgumentsCollection implements ParsedArgumentsCollectionInterface {
  private readonly args: Record<string, unknown> = {};

  /**
   * Adds a new argument to the collection.
   * @param name - The name of the argument.
   * @param value - The value of the argument.
   * @returns The instance of ParsedArgumentsCollection for chaining.
   */
  public add(name: string, value: unknown) {
    this.args[this.formatName(name)] = value;
    return this;
  }

  /**
   * Retrieves an argument value.
   * @param name - The name of the argument.
   * @returns The value of the argument, or undefined if not found.
   */
  public get<T = unknown>(name: string): T {
    return (this.args[this.formatName(name)] ?? undefined) as T;
  }

  /**
   * Checks if an argument exists in the collection.
   * @param name - The name of the argument.
   * @returns True if the argument exists, otherwise false.
   */
  public has(name: string): boolean {
    return this.args[this.formatName(name)] !== undefined;
  }

  /**
   * Returns all arguments as a record.
   */
  public get all(): Record<string, unknown> {
    return { ...this.args };
  }

  /**
   * Formats the argument name by removing leading dashes.
   * @param name - The argument name.
   * @returns The formatted name.
   */
  private formatName(name: string): string {
    return name.replace(/^--/, '');
  }
}

/**
 * Parser for command-line arguments.
 */
export class ArgsParser implements ArgsParserInterface {
  private readonly argsMap: Map<string, FormattedArgConfig> = new Map();
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
   * Adds a new argument configuration to the parser.
   * @param config - The argument configuration.
   * @returns The instance of ArgsParser for chaining.
   */
  public addArgument(config: ArgConfig): ArgsParser {
    this.checkArgumentConfig(config);

    this.argsMap.set(config.name, this.formatArgConfig(config));
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
    const required = new Set([...this.argsMap.values()].filter((x) => x.required));
    const notEmpty = new Set([...this.argsMap.values()].filter((x) => x.notEmpty));
    const hasDefault = new Set([...this.argsMap.values()].filter((x) => x.default !== undefined));

    const parsedArgs = parseArgsString(argsString);
    const result = new ParsedArgumentsCollection();

    for (const [key, value] of Object.entries(parsedArgs)) {
      const argConfig = this.getArgConfig(key);

      if (notEmpty.has(argConfig) && value === '') {
        throw new ArgumentValueError(`Argument ${this.formatNameWithAlias(argConfig)} value cannot be empty.`);
      }

      if (argConfig.allowedValues !== undefined && !argConfig.allowedValues.includes(value)) {
        throw new ArgumentValueError(`Argument ${this.formatNameWithAlias(argConfig)} value must be one of ${argConfig.allowedValues.join(', ')}.`);
      }

      if (argConfig.validator !== undefined && !argConfig.validator(value)) {
        throw new ArgumentValueError(`Argument ${this.formatNameWithAlias(argConfig)} value is invalid.`);
      }

      required.delete(argConfig);
      hasDefault.delete(argConfig);

      result.add(argConfig.name, castArgValue(value, argConfig.type, argConfig.multiple, argConfig.default));
    }

    for (const argConfig of hasDefault) {
      result.add(argConfig.name, argConfig.default);
      required.delete(argConfig);
    }

    if (required.size > 0) {
      throw new ArgumentValueError(`Required arguments not provided: ${[...required].map((x) => x.name).join(', ')}`);
    }

    return result;
  }

  /**
   * Formats an argument configuration.
   * @param config - The argument configuration.
   * @returns A formatted argument configuration.
   */
  private formatArgConfig(config: ArgConfig): FormattedArgConfig {
    return {
      ...config,
      required: config.required ?? false,
      notEmpty: config.notEmpty ?? false,
      multiple: config.multiple ?? false,
    };
  }

  /**
   * Formats the argument name and alias for error messages.
   * @param argConfig - The argument configuration.
   * @returns A formatted string with the argument name and alias.
   */
  private formatNameWithAlias(argConfig: ArgConfig): string {
    return `${argConfig.name} ${argConfig.alias ? `(${argConfig.alias})` : ''}`;
  }

  /**
   * Checks the validity of an argument configuration.
   * @param config - The argument configuration.
   * @throws AddArgumentError if the configuration is invalid.
   */
  private checkArgumentConfig(config: ArgConfig) {
    if (!config.name.startsWith('--')) {
      throw new AddArgumentError(`Argument name must start with '--' ("${config.name}" given).`);
    }

    if (config.alias !== undefined && !config.alias.startsWith('-')) {
      throw new AddArgumentError(`Argument alias must start with '-' ("${config.alias}" given).`);
    }

    if (this.usedArgs.has(config.name)) {
      throw new AddArgumentError(`Argument ${config.name} already exists.`);
    }

    if (config.alias !== undefined && this.usedArgs.has(config.alias)) {
      throw new AddArgumentError(`Argument ${config.alias} already exists.`);
    }
  }

  /**
   * Retrieves the argument configuration for a given key.
   * @param key - The argument key.
   * @returns The corresponding FormattedArgConfig.
   * @throws ArgumentNameError if the argument key is unknown.
   */
  private getArgConfig(key: string): FormattedArgConfig {
    const config = this.argsMap.get(this.aliasMap.get(key) ?? key);
    if (config === undefined) {
      throw new ArgumentNameError(`Unknown argument ${key}.`);
    }
    return config;
  }
}
