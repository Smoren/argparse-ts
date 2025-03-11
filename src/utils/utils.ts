import type { ArgConfig, NArgs, NArgsConfig } from "../types";
import { ArgumentValueError } from "../exceptions";

export function castArgValue(
  value: string,
  argConfig: ArgConfig,
  nargsConfig: NArgsConfig,
  isset: boolean = true,
  recursive: boolean = false,
): unknown {
  const multiple = recursive ? false : nargsConfig.multiple;

  if (!isset) {
    if (multiple) {
      return argConfig.default ?? [];
    }
    return argConfig.default;
  }

  if (multiple) {
    const result = value.split(' ')
      .filter((x) => x !== '')
      .map((v) => castArgValue(v, argConfig, nargsConfig, isset, true));

    return result.length > 0 ? result : (argConfig.const ?? []);
  }

  const _value = value !== '' ? value : (argConfig.const ?? value);

  if (_value === undefined) {
    return _value;
  }

  switch (argConfig.type) {
    case 'string': return _value;
    case 'number': return Number(_value);
    case 'boolean': return typeof _value === 'boolean' ? _value : _value !== 'false' && _value !== '0';
  }
}

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

export function formatArgNameWithAlias(argConfig: ArgConfig): string {
  return `${argConfig.name}${argConfig.alias ? ` (${argConfig.alias})` : ''}`;
}

export function buildNArgsConfig(argConfig: ArgConfig): NArgsConfig {
  const multiple = argConfig.nargs === '*' || argConfig.nargs === '+' || typeof argConfig.nargs === 'number';
  const allowEmpty = argConfig.nargs === '*' || argConfig.nargs === '?' || argConfig.default !== undefined;
  const count = typeof argConfig.nargs === 'number' ? argConfig.nargs : undefined;
  return { multiple, allowEmpty, count };
}
