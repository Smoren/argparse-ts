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
 * Predefined actions for the argument parser.
 *
 * @category Types
 */
export type PredefinedAction = 'version' | 'help';

/**
 * A function that takes a value and does something with it.
 *
 * @category Types
 */
export type ActionFunction = ((value: unknown, parser: ArgsParserInterface) => void);

/**
 * An action that can be used with the argument parser.
 * It can be a predefined action or a function that takes a value
 * and does something with it.
 *
 * @category Types
 */
export type Action = PredefinedAction | ActionFunction;

/**
 * Configuration for the argument parser.
 *
 * @category Types
 */
export type ArgParserConfig = {
  /**
   * The name of the program.
   */
  name?: string;
  /**
   * The version of the program.
   */
  version?: string;
  /**
   * Whether to exit the program on exception (true by default).
   */
  exitOnException?: boolean;
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
   * Whether the argument is required.
   */
  required?: boolean;
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
   * A custom action for the argument.
   */
  action?: Action;
  /**
   * A custom validator function for the argument value.
   */
  validator?: (value: unknown) => boolean;
}

/**
 * Configuration for an action used with the argument parser.
 *
 * @category Types
 */
export type ActionConfig = {
  /**
   * The name of the action.
   */
  name: string;
  /**
   * An optional alias for the action.
   */
  alias?: string;
  /**
   * A description of the action.
   */
  description?: string;
  /**
   * The action to be performed.
   */
  action: Action;
}

/**
 * ArgConfig extension.
 *
 * @category Types
 */
export type ArgExtraConfig = {
  /**
   * If the argument is positional.
   */
  positional: boolean;
  /**
   * If the argument is multiple.
   */
  multiple: boolean;
  /**
   * If the argument is required.
   */
  required: boolean;
  /**
   * If the argument is allowed to be empty.
   */
  allowEmpty: boolean;
  /**
   * The minimum number of times the argument is allowed to appear.
   */
  minValuesCount: number;
  /**
   * The number of times the argument is allowed to appear.
   * If not defined, it means the argument can appear any number of times.
   */
  valuesCount?: number;
}

/**
 * Extended configuration for an argument, combining both input and extra configurations.
 *
 * @category Types
 */
export type ArgConfigExtended = ArgConfig & ArgExtraConfig;

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
  readonly options: Record<string, unknown>;
  /**
   * Retrieves an argument value by name.
   *
   * @param name - The name of the argument.
   *
   * @returns The value of the argument.
   */
  get<T = unknown>(name: string): T;
  /**
   * Checks if an argument exists in the collection.
   *
   * @param name - The name of the argument.
   *
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
   * The configuration of the argument parser.
   */
  readonly config: ArgParserConfig;
  /**
   * The help message for the arguments.
   */
  readonly help: string;
  /**
   * Adds an argument configuration to the parser.
   *
   * @param config - The argument configuration.
   *
   * @returns The updated parser.
   */
  addArgument(config: ArgConfig): ArgsParserInterface;
  /**
   * Adds an action configuration to the parser.
   *
   * @param config - The action configuration.
   *
   * @returns The updated parser.
   */
  addAction(config: ActionConfig): ArgsParserInterface;
  /**
   * Adds a help action to the parser.
   *
   * @param name - The name of the help action.
   * @param alias - The alias of the help action.
   *
   * @returns The updated parser.
   */
  addHelpAction(name: string, alias: string): ArgsParserInterface;
  /**
   * Adds a version action to the parser.
   *
   * @param name - The name of the version action.
   * @param alias - The alias of the version action.
   *
   * @returns The updated parser.
   */
  addVersionAction(name: string, alias: string): ArgsParserInterface;
  /**
   * Parses the given argument string and returns a collection of parsed arguments.
   *
   * @param argv - The argument string.
   *
   * @returns A ParsedArgumentsCollection containing the parsed arguments.
   */
  parse(argv: string[]): ParsedArgumentsCollectionInterface;
}

/**
 * Interface for a value validator.
 *
 * @category Interfaces
 */
export interface ValueValidatorInterface {
  /**
   * Validates the argument value before casting.
   *
   * @param value - The value to validate.
   * @param isset - Whether the value is set.
   *
   * @throws ArgumentValueError if the value is invalid.
   */
  validateBeforeCast(value: string[], isset: boolean): void;
  /**
   * Validates the argument value after casting.
   *
   * @param value - The value to validate.
   *
   * @throws ArgumentValueError if the value is invalid.
   */
  validateAfterCast(value: string[]): void;
}

/**
 * Interface for a value caster.
 *
 * @template T - The expected type of the argument value.
 *
 * @category Interfaces
 */
export interface ValueCasterInterface<T> {
  /**
   * Casts the argument value to the expected type.
   *
   * @param value - The value to cast.
   * @param isset - Whether the value is set.
   *
   * @returns The casted value.
   */
  cast(value: string[], isset: boolean): T | undefined;
}
