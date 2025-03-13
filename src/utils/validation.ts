import type { ArgConfig, ArgConfigExtended, ValueValidatorInterface } from "../types";
import { ArgumentConfigError, ArgumentValueError } from "../exceptions";
import { formatArgNameWithAlias } from "./utils";

export function validateArgConfig(config: ArgConfig, usedArgs: Set<string>): void {
  if (!config.name.startsWith('-') && config.required !== undefined) {
    throw new ArgumentConfigError(`Positional argument ${config.name} cannot be required.`);
  }

  if (config.name.startsWith('-') && !config.name.startsWith('--')) {
    throw new ArgumentConfigError(`Argument name ${config.name} is invalid.`);
  }

  if (config.alias !== undefined && (!config.alias.startsWith('-') || config.alias.startsWith('--'))) {
    throw new ArgumentConfigError(`Argument name ${config.name} is invalid.`);
  }

  if (usedArgs.has(config.name)) {
    throw new ArgumentConfigError(`Argument ${config.name} already exists.`);
  }

  if (config.alias !== undefined && usedArgs.has(config.alias)) {
    throw new ArgumentConfigError(`Argument ${config.alias} already exists.`);
  }
}

export function checkEnoughPositionalValues(values: string[], argConfig: ArgConfigExtended): void {
  const errorMessage = `Not enough positional arguments. ${argConfig.name} is required.`;

  if (!argConfig.multiple) {
    if (!argConfig.allowEmpty && values.length === 0) {
      throw new ArgumentValueError(errorMessage);
    }
    return;
  }

  if (!argConfig.allowEmpty && values.length === 0) {
    throw new ArgumentValueError(errorMessage);
  }

  if (!argConfig.allowEmpty && argConfig.valuesCount !== undefined && argConfig.valuesCount > values.length) {
    throw new ArgumentValueError(errorMessage);
  }
}

export function checkAllPositionalValuesUsed(values: string[]): void {
  if (values.length > 0) {
    throw new ArgumentValueError('Too many positional arguments.');
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
