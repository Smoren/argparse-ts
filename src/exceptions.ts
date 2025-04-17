/**
 * Base error class for all exceptions thrown by `ArgsParser`.
 *
 * @category Exceptions
 */
export class ArgsParserException extends Error {
  public readonly names: string[] = [];

  constructor(message?: string) {
    super(message);
    this.names.push('ArgsParserException');
  }
}

/**
 * Base error class for all errors thrown by `ArgsParser`.
 *
 * @category Exceptions
 */
export class ArgsParserError extends ArgsParserException {
  constructor(message?: string) {
    super(message);
    this.names.push('ArgsParserError');
  }
}

/**
 * Thrown when trying to add an argument with a name that already exists.
 *
 * @category Exceptions
 */
export class ArgumentConfigError extends ArgsParserError {
  constructor(message?: string) {
    super(message);
    this.names.push('ArgumentConfigError');
  }
}

/**
 * Thrown when the argument name is invalid.
 *
 * @category Exceptions
 */
export class ArgumentNameError extends ArgsParserError {
  constructor(message?: string) {
    super(message);
    this.names.push('ArgumentNameError');
  }
}

/**
 * Thrown when the argument value is invalid.
 *
 * @category Exceptions
 */
export class ArgumentValueError extends ArgsParserError {
  constructor(message?: string) {
    super(message);
    this.names.push('ArgumentValueError');
  }
}

/**
 * Thrown when the parser should stop processing arguments.
 *
 * @category Exceptions
 */
export class StopException extends ArgsParserException {
  constructor(message?: string) {
    super(message);
    this.names.push('StopException');
  }
}

/**
 * Checks if the given exception is an instance of the specified class.
 *
 * @param e - The exception to check.
 * @param instanceOf - The class to check against.
 *
 * @returns `true` if the exception is an instance of the specified class, `false` otherwise.
 */
export function isExceptionInstanceOf(e: unknown, instanceOf: typeof ArgsParserException): boolean {
  if (!('names' in (e as Error)) || !Array.isArray((e as ArgsParserException).names)) {
    return false;
  }
  const currentNames = (e as ArgsParserException).names;
  const instanceNames = (new instanceOf()).names;
  return instanceNames.every((name) => currentNames.includes(name));
}
