/**
 * Base error class for all errors thrown by `ArgsParser`.
 *
 * @category Exceptions
 */
export class ArgsParserException extends Error {}

/**
 * Thrown when trying to add an argument with a name that already exists.
 *
 * @category Exceptions
 */
export class ArgumentConfigError extends ArgsParserException {}

/**
 * Thrown when the argument name is invalid.
 *
 * @category Exceptions
 */
export class ArgumentNameError extends ArgsParserException {}

/**
 * Thrown when the argument value is invalid.
 *
 * @category Exceptions
 */
export class ArgumentValueError extends ArgsParserException {}

/**
 * Thrown when the parser should stop processing arguments.
 *
 * @category Exceptions
 */
export class StopException extends ArgsParserException {}
