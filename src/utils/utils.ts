import type { ArgConfig, NArgs, NArgsConfig } from "../types";
import { ArgumentValueError } from "../exceptions";

export function parseArgsArray(argv: string[]): [string[], Record<string, string[]>] {
  const foundIndex = argv.findIndex((x) => x.startsWith('-'));
  const optionalBegin = foundIndex !== -1 ? foundIndex : argv.length;

  const positional: string[] = [...argv.slice(0, optionalBegin)];
  const optionalBuffer = [...argv.slice(optionalBegin)].reverse();
  const optional: Record<string, string[]> = {};

  let argName: string | undefined = undefined;
  let argValues: string[] = [];

  while (optionalBuffer.length > 0) {
    const item = optionalBuffer.pop()!;

    if (item.match(/^-[a-zA-Z0-9]{2,}$/)) {
      const items = item.slice(1).split('').reverse();
      optionalBuffer.push(...items.map((x) => `-${x}`));
      continue;
    }

    if (item.startsWith('-')) {
      if (argName !== undefined) {
        optional[argName] = argValues;
      }
      argName = item;
      argValues = [];
    } else {
      argValues.push(item);
    }
  }

  if (argName !== undefined) {
    optional[argName] = argValues;
  }

  return [positional, optional];
}

/**
 * Casts the given value to the type of the argument configuration.
 *
 * @param value - The value to cast.
 * @param argConfig - The argument configuration.
 * @param nargsConfig - The nargs configuration.
 * @param isset - Whether the argument is set. Defaults to true.
 * @param recursive - Whether this is a recursive call. Defaults to false.
 *
 * @returns The casted value.
 *
 * @category Utils
 */
export function castArgValue(
  value: string[],
  argConfig: ArgConfig,
  nargsConfig: NArgsConfig,
  isset: boolean = true,
  recursive: boolean = false,
): unknown {
  const multiple = recursive ? false : nargsConfig.multiple;

  if (!isset) {
    return argConfig.default;
  }

  if (multiple) {
    const result = value
      .filter((x) => x !== '')
      .map((v) => castArgValue([v], argConfig, nargsConfig, isset, true));

    return result.length > 0 ? result : (argConfig.const ?? []);
  }

  let _value: unknown;
  if (value.length === 1) {
    _value = value[0];
  } else if (value.length === 0) {
    _value = argConfig.const;
  } else {
    throw new ArgumentValueError(`Too many values for single argument: ${formatArgNameWithAlias(argConfig)}`);
  }

  if (_value === undefined) {
    return _value;
  }

  switch (argConfig.type) {
    case 'string': return _value;
    case 'number': return Number(_value);
    case 'boolean': return typeof _value === 'boolean' ? _value : _value !== 'false' && _value !== '0';
  }
}

/**
 * Validates the casted argument value.
 *
 * @param value - The casted argument value.
 * @param argConfig - The argument configuration.
 * @param nargsConfig - The nargs configuration.
 *
 * @returns The validated value.
 *
 * @throws ArgumentValueError if the value is invalid.
 *
 * @category Utils
 */
export function validateCastedArgValue<T>(value: T, argConfig: ArgConfig, nargsConfig: NArgsConfig): T {
  if (argConfig.choices !== undefined) {
    if (!nargsConfig.multiple && !argConfig.choices.includes(value)) {
      throw new ArgumentValueError(
        `Argument ${formatArgNameWithAlias(argConfig)} value must be one of ${argConfig.choices.join(', ')}.`
      );
    } else if (nargsConfig.multiple && !(value as unknown[]).every((x) => argConfig.choices!.includes(x))) {
      throw new ArgumentValueError(
        `Argument ${formatArgNameWithAlias(argConfig)} values must be some of ${argConfig.choices.join(', ')}.`
      );
    }
  }

  if (argConfig.validator !== undefined && !argConfig.validator(value)) {
    throw new ArgumentValueError(`Argument ${formatArgNameWithAlias(argConfig)} value is invalid.`);
  }

  return value;
}

/**
 * Formats the argument name with alias.
 *
 * @param argConfig - The argument configuration.
 *
 * @returns The formatted argument name.
 *
 * @category Utils
 */
export function formatArgNameWithAlias(argConfig: ArgConfig): string {
  return `${argConfig.name}${argConfig.alias ? ` (${argConfig.alias})` : ''}`;
}

/**
 * Builds the NArgs configuration from an argument configuration.
 *
 * @param argConfig - The argument configuration.
 *
 * @returns The NArgs configuration.
 *
 * @category Utils
 */
export function buildNArgsConfig(argConfig: ArgConfig): NArgsConfig {
  const multiple = argConfig.nargs === '*' || argConfig.nargs === '+' || typeof argConfig.nargs === 'number';
  const allowEmpty = argConfig.nargs === '*' || argConfig.nargs === '?' || argConfig.default !== undefined || argConfig.const !== undefined;
  const count = typeof argConfig.nargs === 'number' ? argConfig.nargs : undefined;
  return { multiple, allowEmpty, count };
}
