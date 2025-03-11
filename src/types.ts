/**
 * Represents the type of argument.
 *
 * @category Types
 */
export type ArgType = 'string' | 'number' | 'boolean';

export type NArgs = number | '?' | '*' | '+';

/**
 * Configuration for an argument.
 *
 * @category Types
 */
export type ArgConfig = {
  /**
   * The type of the argument.
   */
  type: ArgType;
  /**
   * The name of the argument.
   */
  name: string;
  /**
   * An optional alias for the argument.
   */
  alias?: string;
  /**
   * A description of the argument.
   */
  description?: string;
  /**
   * Whether the argument is required.
   */
  nargs?: NArgs;
  /**
   * The default value of the argument.
   */
  default?: unknown;
  /**
   * Allowed values for the argument.
   */
  choices?: unknown[];
  /**
   * A custom validator function for the argument value.
   */
  validator?: (value: unknown) => boolean;
}

/**
 * Interface for a collection of parsed arguments.
 *
 * @category Interfaces
 */
export interface ParsedArgumentsCollectionInterface {
  /**
   * All parsed arguments as a record.
   */
  readonly all: Record<string, unknown>;
  /**
   * Adds an argument to the collection.
   * @param name - The name of the argument.
   * @param value - The value of the argument.
   * @returns The updated collection.
   */
  add(name: string, value: unknown): ParsedArgumentsCollectionInterface;
  /**
   * Retrieves an argument value by name.
   * @param name - The name of the argument.
   * @returns The value of the argument.
   */
  get<T = unknown>(name: string): T;
  /**
   * Checks if an argument exists in the collection.
   * @param name - The name of the argument.
   * @returns True if the argument exists, false otherwise.
   */
  has(name: string): boolean;
}

/**
 * Interface for an argument parser.
 *
 * @category Interfaces
 */
export interface ArgsParserInterface {
  /**
   * The help message for the arguments.
   */
  readonly help: string;
  /**
   * Adds an argument configuration to the parser.
   * @param config - The argument configuration.
   * @returns The updated parser.
   */
  addArgument(config: ArgConfig): ArgsParserInterface;
  /**
   * Parses a string of arguments.
   * @param argsString - The string containing the arguments.
   * @returns A collection of parsed arguments.
   */
  parse(argsString: string): ParsedArgumentsCollectionInterface;
}
