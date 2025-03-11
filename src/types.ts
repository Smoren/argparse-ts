/**
 * Represents the type of argument.
 *
 * @category Types
 */
export type ArgType = 'string' | 'number' | 'boolean';

/**
 * The type of nargs. It can be a number, or one of the following symbols:
 * - `?`: The argument is optional.
 * - `*`: The argument is optional and can appear multiple times.
 * - `+`: The argument is required and can appear multiple times.
 *
 * @category Types
 */
export type NArgs = number | '?' | '*' | '+';

/**
 * The configuration for nargs.
 *
 * @category Types
 */
export type NArgsConfig = {
  /**
   * If the argument is multiple.
   */
  multiple: boolean;
  /**
   * If the argument is allowed to be empty.
   */
  allowEmpty: boolean;
  /**
   * The number of times the argument is allowed to appear.
   * If not defined, it means the argument can appear any number of times.
   */
  count?: number;
}

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
   * A constant value for the argument.
   */
  const?: unknown;
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
   * All positional arguments as a record.
   */
  readonly positional: Record<string, unknown>;
  /**
   * All optional arguments as a record.
   */
  readonly optional: Record<string, unknown>;
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
   * Adds the help message for the arguments to the parser.
   * @returns The updated parser.
   */
  addHelp(): ArgsParserInterface;
  /**
   * Parses a string of arguments.
   * @param argsString - The string containing the arguments.
   * @returns A collection of parsed arguments.
   */
  parse(argsString: string): ParsedArgumentsCollectionInterface;
}
