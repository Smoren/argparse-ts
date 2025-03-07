/**
 * Base error class for all errors thrown by `ArgsParser`.
 *
 * @category Exceptions
 */
export class ArgsParserError extends Error {}

/**
 * Thrown when trying to add an argument with a name that already exists.
 *
 * @category Exceptions
 */
export class AddArgumentError extends ArgsParserError {}

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
