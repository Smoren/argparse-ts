import type { ArgConfig, ArgConfigExtended, NArgs, NArgsConfig } from "../types";
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
 * @param isset - Whether the argument is set. Defaults to true.
 * @param recursive - Whether this is a recursive call. Defaults to false.
 *
 * @returns The casted value.
 *
 * @category Utils
 */
export function castArgValue(
  value: string[],
  argConfig: ArgConfigExtended,
  isset: boolean = true,
  recursive: boolean = false,
): unknown {
  const multiple = recursive ? false : argConfig.multiple;

  if (!recursive) {
    validateArgValueBeforeCast(value, argConfig, isset);
  }

  if (!isset) {
    return argConfig.default;
  }

  if (multiple) {
    const result = value
      .filter((x) => x !== '')
      .map((v) => castArgValue([v], argConfig, isset, true));

    return result.length > 0 ? result : (argConfig.const ?? []);
  }

  let result: unknown;
  if (value.length === 1) {
    result = value[0];
  } else if (value.length === 0) {
    result = argConfig.const;
  } else {
    throw new ArgumentValueError(`Too many values for single argument: ${formatArgNameWithAlias(argConfig)}`);
  }

  if (result === undefined) {
    return result;
  }

  switch (argConfig.type) {
    case 'string':
      result = String(result);
      break;
    case 'number':
      result = Number(result);
      break;
    case 'boolean':
      result = typeof result === 'boolean' ? result : result !== 'false' && result !== '0';
      break;
  }

  if (!recursive) {
    validateArgValueAfterCast(result, argConfig);
  }

  return result;
}

export function validateArgValueBeforeCast(value: string[], argConfig: ArgConfigExtended, isset: boolean): void {
  if (!isset && argConfig.required && value.length === 0) {
    throw new ArgumentValueError(`Argument ${formatArgNameWithAlias(argConfig)} is required.`);
  }

  if (isset && !argConfig.allowEmpty && value.length === 0) {
    throw new ArgumentValueError(`Argument ${formatArgNameWithAlias(argConfig)} cannot be empty.`);
  }
}

/**
 * Validates the casted argument value.
 *
 * @param value - The casted argument value.
 * @param argConfig - The argument configuration.
 *
 * @returns The validated value.
 *
 * @throws ArgumentValueError if the value is invalid.
 *
 * @category Utils
 */
export function validateArgValueAfterCast(value: unknown, argConfig: ArgConfigExtended): void {
  if (argConfig.choices !== undefined) {
    if (!argConfig.multiple && !argConfig.choices.includes(value)) {
      throw new ArgumentValueError(
        `Argument ${formatArgNameWithAlias(argConfig)} value must be one of ${argConfig.choices.join(', ')}.`
      );
    } else if (argConfig.multiple && !(value as unknown[]).every((x) => argConfig.choices!.includes(x))) {
      throw new ArgumentValueError(
        `Argument ${formatArgNameWithAlias(argConfig)} values must be some of ${argConfig.choices.join(', ')}.`
      );
    }
  }

  if (argConfig.validator !== undefined && !argConfig.validator(value)) {
    throw new ArgumentValueError(`Argument ${formatArgNameWithAlias(argConfig)} value is invalid.`);
  }
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
  const required = argConfig.nargs === '*' || argConfig.nargs === '?' || argConfig.default !== undefined;
  const allowEmpty = argConfig.nargs === '*' || argConfig.nargs === '?' || argConfig.const !== undefined;
  const count = typeof argConfig.nargs === 'number' ? argConfig.nargs : undefined;
  return { multiple, required, allowEmpty, count };
}
