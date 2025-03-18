/**
 * Base error class for all exceptions thrown by `ArgsParser`.
 *
 * @category Exceptions
 */
export class ArgsParserException extends Error {}

/**
 * Base error class for all errors thrown by `ArgsParser`.
 *
 * @category Exceptions
 */
export class ArgsParserError extends ArgsParserException {}

/**
 * Thrown when trying to add an argument with a name that already exists.
 *
 * @category Exceptions
 */
export class ArgumentConfigError extends ArgsParserError {}

/**
 * Thrown when the argument name is invalid.
 *
 * @category Exceptions
 */
export class ArgumentNameError extends ArgsParserError {}

/**
 * Thrown when the argument value is invalid.
 *
 * @category Exceptions
 */
export class ArgumentValueError extends ArgsParserError {}

/**
 * Thrown when the parser should stop processing arguments.
 *
 * @category Exceptions
 */
export class StopException extends ArgsParserException {}
