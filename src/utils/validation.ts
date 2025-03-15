import type { ArgConfig, ArgConfigExtended, ValueValidatorInterface } from "../types";
import { ArgumentConfigError, ArgumentValueError } from "../exceptions";
import { formatArgNameWithAlias } from "./utils";

/**
 * Validates an argument configuration.
 *
 * @param config - The argument configuration.
 * @param usedArgs - A set of used argument names and aliases.
 *
 * @throws {ArgumentConfigError} - If the argument configuration is invalid.
 *
 * @category Utils
 * @category Validation
 */
export function validateArgConfig(config: ArgConfig, usedArgs: Set<string>): void {
  if (!config.name.startsWith('-')) {
    validatePositionalArgConfig(config);
  } else {
    validateOptionalArgConfig(config);
  }

  // Check if the argument name is already used
  if (usedArgs.has(config.name)) {
    throw new ArgumentConfigError(`Argument with such name already exists: ${config.name}.`);
  }

  // Check if the argument alias is defined and already used
  if (config.alias !== undefined && usedArgs.has(config.alias)) {
    throw new ArgumentConfigError(`Argument with such alias already exists: ${config.alias}.`);
  }
}

/**
 * Validates a positional argument configuration.
 *
 * @param config - The positional argument configuration.
 *
 * @throws {ArgumentConfigError} - If the positional argument configuration is invalid.
 *
 * @category Utils
 * @category Validation
 */
export function validatePositionalArgConfig(config: ArgConfig): void {
  // Positional argument cannot be required
  if (config.required !== undefined) {
    throw new ArgumentConfigError(`Positional argument cannot be required: ${config.name}.`);
  }

  // Positional argument cannot have alias
  if (config.alias !== undefined) {
    throw new ArgumentConfigError(`Positional argument cannot have alias: ${config.name}.`);
  }
}

/**
 * Validates an optional argument configuration.
 *
 * @param config - The optional argument configuration.
 *
 * @throws {ArgumentConfigError} - If the optional argument configuration is invalid.
 *
 * @category Utils
 * @category Validation
 */
export function validateOptionalArgConfig(config: ArgConfig): void {
  // Optional argument must start with '--'
  if (!config.name.startsWith('--')) {
    throw new ArgumentConfigError(`Argument name is invalid: ${config.name}.`);
  }

  if (config.alias !== undefined) {
    // Optional argument alias must start with '-' and not with '--'
    if (!config.alias.startsWith('-') || config.alias.startsWith('--')) {
      throw new ArgumentConfigError(`Argument alias is invalid: ${config.alias}.`);
    }

    // Optional argument alias cannot be a number
    if (!isNaN(Number(config.alias))) {
      throw new ArgumentConfigError(`Argument alias cannot be a number: ${config.alias}.`);
    }
  }
}

/**
 * Checks if there are enough positional values to satisfy the given argument
 * configuration and the remaining argument configurations.
 *
 * @param values - The remaining positional values.
 * @param argConfig - The current argument configuration.
 * @param remainingArgConfigs - The remaining argument configurations.
 *
 * @throws {ArgumentValueError} - If there are not enough positional values.
 *
 * @category Utils
 * @category Validation
 */
export function checkEnoughPositionalValues(
  values: string[],
  argConfig: ArgConfigExtended,
  remainingArgConfigs: ArgConfigExtended[],
): void {
  // Collect all argument names from the current and remaining configurations
  const allArgNames = [argConfig, ...remainingArgConfigs].map((x) => x.name);
  const errorMessage = `The following arguments are required: ${allArgNames.join(', ')}`;

  // If the argument is not multiple
  if (!argConfig.multiple) {
    // Throw an error if the argument does not allow empty values and no values are provided
    if (!argConfig.allowEmpty && values.length === 0) {
      throw new ArgumentValueError(errorMessage);
    }
    return;
  }

  // For multiple arguments, check if they do not allow empty values
  if (!argConfig.allowEmpty && values.length === 0) {
    // Throw an error if no values are provided
    throw new ArgumentValueError(errorMessage);
  }

  // If a specific number of values is required, check if enough values are provided
  if (!argConfig.allowEmpty && argConfig.valuesCount !== undefined && argConfig.valuesCount > values.length) {
    // Throw an error if not enough values are provided
    throw new ArgumentValueError(errorMessage);
  }
}

/**
 * Checks if all positional values are used.
 *
 * @param values - The remaining positional values.
 *
 * @throws {ArgumentValueError} - If there are any remaining positional values.
 *
 * @category Utils
 * @category Validation
 */
export function checkAllPositionalValuesUsed(values: string[]): void {
  // Check if there are any remaining positional values
  if (values.length > 0) {
    // Throw an error for unrecognized positional arguments
    throw new ArgumentValueError(`Unrecognized positional arguments: ${values.join(' ')}.`);
  }
}

/**
 * Checks if all options in the parsed options are recognized according to the provided argument configurations.
 *
 * @param parsedOptions - A record of options that have been parsed.
 * @param argConfigs - A record of argument configurations against which the options are validated.
 *
 * @throws {ArgumentValueError} - If there are any unrecognized options.
 *
 * @category Utils
 * @category Validation
 */
export function checkAllOptionsRecognized(
  parsedOptions: Record<string, unknown>,
  argConfigs: Record<string, ArgConfigExtended | undefined>,
): void {
  // Check if there are any unrecognized options
  const unrecognizedOptions = Object.keys(parsedOptions).filter((key) => argConfigs[key] === undefined);
  if (unrecognizedOptions.length > 0) {
    // Throw an error for unrecognized options
    throw new ArgumentValueError(`Unrecognized options: ${unrecognizedOptions.join(', ')}.`);
  }
}

export function createValueValidator(argConfig: ArgConfigExtended): BaseValueValidator {
  if (argConfig.multiple) {
    return new ArrayValueValidator(argConfig);
  }
  return createSingleValueValidator(argConfig);
}

function createSingleValueValidator(argConfig: ArgConfigExtended): BaseValueValidator {
  switch (argConfig.type) {
    case 'string':
      return new StringValueValidator(argConfig);
    case 'number':
      return new NumberValueValidator(argConfig);
    case 'boolean':
      return new BooleanValueValidator(argConfig);
  }
}

abstract class BaseValueValidator implements ValueValidatorInterface {
  protected argConfig: ArgConfigExtended;

  constructor(argConfig: ArgConfigExtended) {
    this.argConfig = argConfig;
  }

  public validateBeforeCast(value: string[], isset: boolean): void {
    if (!isset && this.argConfig.required && value.length === 0) {
      throw new ArgumentValueError(`Argument ${formatArgNameWithAlias(this.argConfig)} is required.`);
    }

    if (isset && !this.argConfig.allowEmpty && value.length === 0) {
      throw new ArgumentValueError(`Argument ${formatArgNameWithAlias(this.argConfig)} cannot be empty.`);
    }
  };

  public validateAfterCast(value: unknown): void {
    if (this.argConfig.validator !== undefined && !this.argConfig.validator(value)) {
      throw new ArgumentValueError(`Argument ${formatArgNameWithAlias(this.argConfig)} value is invalid.`);
    }
  }
}

abstract class SingleValueValidator extends BaseValueValidator {
  public validateBeforeCast(value: string[], isset: boolean): void {
    super.validateBeforeCast(value, isset);

    if (value.length > 1) {
      throw new ArgumentValueError(`Argument ${formatArgNameWithAlias(this.argConfig)} expects a single value.`);
    }

    if (this.argConfig.choices !== undefined && !this.argConfig.choices.includes(value[0]!)) {
      throw new ArgumentValueError(
        `Argument ${formatArgNameWithAlias(this.argConfig)} value must be one of ${this.argConfig.choices.join(', ')}.`
      );
    }
  }
}

class StringValueValidator extends SingleValueValidator {}

class NumberValueValidator extends SingleValueValidator {
  public validateBeforeCast(value: string[], isset: boolean) {
    super.validateBeforeCast(value, isset);

    if (value.length > 0 && isNaN(parseFloat(value[0]))) {
      throw new ArgumentValueError(`Argument ${formatArgNameWithAlias(this.argConfig)} value is not a number.`);
    }
  }
}

class BooleanValueValidator extends SingleValueValidator {
  public validateBeforeCast(value: string[], isset: boolean) {
    super.validateBeforeCast(value, isset);

    if (value.length > 0 && !['true', 'false', '1', '0'].includes(value[0].toLowerCase())) {
      throw new ArgumentValueError(`Argument ${formatArgNameWithAlias(this.argConfig)} value is not a boolean.`);
    }
  }
}

class ArrayValueValidator extends BaseValueValidator {
  protected itemValidator: SingleValueValidator;

  constructor(argConfig: ArgConfigExtended) {
    super(argConfig);
    this.itemValidator = createSingleValueValidator(this.argConfig);
  }

  public validateBeforeCast(value: string[], isset: boolean) {
    super.validateBeforeCast(value, isset);
    (value ?? []).forEach((v) => this.itemValidator.validateBeforeCast([v], isset));
  }

  public validateAfterCast(value: string[]) {
    super.validateAfterCast(value);
    (value ?? []).forEach((v) => this.itemValidator.validateAfterCast([v]));
  }
}
