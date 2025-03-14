import type { ArgConfig, ArgExtraConfig } from "../types";

/**
 * Parses an array of command-line arguments into positional and optional arguments.
 *
 * @param argv - The array of command-line arguments.
 * @returns A tuple containing an array of positional arguments and a record of optional arguments.
 *
 * @category Utils
 *
 * @example
 * ```
 * const argv = ['make', '--flag', '-v', 'a', 'b', 'c'];
 * const [positional, optional] = parseArgsArray(argv);
 * console.log(positional); // ['make']
 * console.log(optional); // { '--flag': [], '-v': ['a', 'b', 'c'] }
 * ```
 */
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
 * Builds the extra configuration for an argument.
 *
 * @param config - The argument configuration.
 *
 * @returns The extra configuration.
 *
 * @category Utils
 */
export function buildArgExtraConfig(config: ArgConfig): ArgExtraConfig {
  const positional = isArgPositional(config);
  const multiple = isArgMultiple(config);
  const required = isArgRequired(config);
  const allowEmpty = isArgAllowEmpty(config)
  const valuesCount = typeof config.nargs === 'number' ? config.nargs : undefined;
  const minValuesCount = valuesCount ?? (allowEmpty ? 0 : 1);
  return { positional, multiple, required, allowEmpty, valuesCount, minValuesCount };
}

/**
 * Determines if the argument is positional.
 *
 * @param config - The argument configuration.
 *
 * @returns True if the argument is positional, otherwise false.
 *
 * @category Utils
 */
function isArgPositional(config: ArgConfig): boolean {
  return !config.name.startsWith('--');
}

/**
 * Determines if the argument can accept multiple values.
 *
 * @param config - The argument configuration.
 *
 * @returns True if the argument can accept multiple values, otherwise false.
 *
 * @category Utils
 */
function isArgMultiple(config: ArgConfig): boolean {
  return config.nargs === '*'
    || config.nargs === '+'
    || typeof config.nargs === 'number';
}

/**
 * Determines if the argument is required.
 *
 * @param config - The argument configuration.
 *
 * @returns True if the argument is required, otherwise false.
 *
 * @category Utils
 */
function isArgRequired(config: ArgConfig): boolean {
  if (config.required) {
    return true;
  }

  if (!isArgPositional(config) && config.nargs === undefined) {
    return false;
  }

  return config.nargs !== '*'
    && config.nargs !== '?'
    && config.default === undefined;
}

/**
 * Determines if the argument allows an empty value.
 *
 * @param config - The argument configuration.
 *
 * @returns True if the argument allows an empty value, otherwise false.
 *
 * @category Utils
 */
function isArgAllowEmpty(config: ArgConfig): boolean {
  return config.nargs === '*'
    || config.nargs === '?'
    || config.const !== undefined
    || (isArgPositional(config) && !isArgRequired(config));
}
