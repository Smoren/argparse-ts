/**
 * Base error class for all errors thrown by `ArgsParser`.
 */
export class ArgsParserError extends Error {}

/**
 * Thrown when trying to add an argument with a name that already exists.
 */
export class AddArgumentError extends ArgsParserError {}

/**
 * Thrown when the argument name is invalid.
 */
export class ArgumentNameError extends ArgsParserError {}

/**
 * Thrown when the argument value is invalid.
 */
export class ArgumentValueError extends ArgsParserError {}
