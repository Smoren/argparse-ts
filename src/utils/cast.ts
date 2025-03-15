import type { ArgConfigExtended, ValueCasterInterface } from "../types";

/**
 * Creates a value caster based on the provided argument configuration.
 *
 * @param argConfig - The extended configuration for the argument to cast.
 *
 * @returns A value caster that can be used to cast the argument value.
 *
 * @category Utils
 * @category Cast
 */
export function createValueCaster(argConfig: ArgConfigExtended): BaseValueCaster<unknown> {
  if (argConfig.multiple) {
    return new ArrayValueCaster(argConfig);
  }
  return createSingleValueCaster(argConfig);
}

/**
 * Creates a value caster for a single value argument based on the provided argument configuration.
 *
 * @param argConfig - The extended configuration for the argument to cast.
 *
 * @returns A value caster that can be used to cast the argument value.
 *
 * @category Utils
 * @category Cast
 */
function createSingleValueCaster(argConfig: ArgConfigExtended): BaseValueCaster<unknown> {
  switch (argConfig.type) {
    case 'string':
      return new StringValueCaster(argConfig);
    case 'number':
      return new NumberValueCaster(argConfig);
    case 'boolean':
      return new BooleanValueCaster(argConfig);
  }
}

/**
 * Base value caster.
 *
 * @category Cast
 */
abstract class BaseValueCaster<T> implements ValueCasterInterface<T> {
  /**
   * The extended configuration for the argument to cast.
   */
  protected argConfig: ArgConfigExtended;

  /**
   * Constructs a base value caster with the provided argument configuration.
   *
   * @param config - The extended configuration for the argument to cast.
   */
  constructor(config: ArgConfigExtended) {
    this.argConfig = config;
  }

  /**
   * Casts the argument value to the expected type.
   *
   * @param value - The value to cast.
   * @param isset - Whether the value is set.
   *
   * @returns The casted value.
   */
  public cast(value: string[], isset: boolean): T | undefined {
    if (!isset) {
      return this.argConfig.default as T;
    }

    if (value.length === 0) {
      return this.argConfig.const as T;
    }

    return undefined;
  }
}

/**
 * An abstract class that provides a single value caster implementation.
 *
 * @template T - The expected type of the argument value.
 *
 * @category Cast
 */
abstract class SingleValueCaster<T extends boolean | number | string> extends BaseValueCaster<T> {
  /**
   * Casts the argument value to the expected type.
   *
   * @param value - The value to cast.
   * @param isset - Whether the value is set.
   *
   * @returns The casted value.
   */
  public cast(value: string[], isset: boolean): T | undefined {
    const baseCasted = super.cast(value, isset);
    if (baseCasted !== undefined) {
      return baseCasted;
    }
    return this.castInternal(this.getSingleValue(value));
  }

  /**
   * Gets the single value from the provided array.
   *
   * @param value - The array of string values to get the single value from.
   *
   * @returns The single value from the array or undefined if the array is empty.
   */
  protected getSingleValue(value: string[]): string | undefined {
    return value[0] ?? undefined;
  }

  /**
   * Casts the argument value to the expected type.
   *
   * @param value - The value to cast.
   *
   * @returns The casted value.
   */
  protected abstract castInternal(value?: string): T | undefined;
}

/**
 * A value caster for a single string argument value.
 *
 * @category Cast
 */
class StringValueCaster extends SingleValueCaster<string> {
  /**
   * Casts the argument value to a string.
   *
   * @param value - The value to cast.
   *
   * @returns The casted string value or undefined if the input value is undefined.
   */
  protected castInternal(value?: string): string | undefined {
    return value !== undefined ? String(value) : undefined;
  }
}

/**
 * A value caster for a single number argument value.
 *
 * @category Cast
 */
class NumberValueCaster extends SingleValueCaster<number> {
  /**
   * Casts the argument value to a number.
   *
   * @param value - The value to cast.
   *
   * @returns The casted number value or undefined if the input value is undefined.
   */
  protected castInternal(value?: string): number | undefined {
    return value !== undefined ? Number(value) : undefined;
  }
}

/**
 * A value caster for a single boolean argument value.
 *
 * @category Cast
 */
class BooleanValueCaster extends SingleValueCaster<boolean> {
  /**
   * Casts the argument value to a boolean.
   *
   * @param value - The value to cast.
   *
   * @returns The casted boolean value or undefined if the input value is undefined.
   */
  protected castInternal(value?: string): boolean | undefined {
    return value !== undefined ? !['false', '0'].includes(value) : undefined;
  }
}

/**
 * A value caster for an array of argument values.
 *
 * @template T - The expected type of the argument item value.
 *
 * @category Cast
 */
class ArrayValueCaster<T> extends BaseValueCaster<T[]> {
  /**
   * The item caster for the array.
   */
  protected itemCaster: BaseValueCaster<T>;

  /**
   * Constructs a new ArrayValueCaster with the provided argument configuration.
   *
   * @param config - The extended configuration for the argument to cast.
   */
  constructor(config: ArgConfigExtended) {
    super(config);
    this.itemCaster = createSingleValueCaster(config) as BaseValueCaster<T>;
  }

  /**
   * Casts the argument value to an array of the expected type.
   *
   * @param value - The value to cast.
   * @param isset - Whether the value is set.
   *
   * @returns The casted value or undefined if the input value is undefined.
   */
  public cast(value: string[], isset: boolean): T[] | undefined {
    const baseCasted = super.cast(value, isset);
    if (baseCasted !== undefined && baseCasted.length > 0) {
      return baseCasted;
    }
    if (value.length === 0 && !isset && !this.argConfig.positional) {
      return undefined;
    }
    return value.map((v) => this.itemCaster.cast([v], isset)!);
  }
}
