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
  const positional = !config.name.startsWith('--');
  const multiple = config.nargs === '*' || config.nargs === '+' || typeof config.nargs === 'number';
  const required = config.required ?? (config.nargs !== '*' && config.nargs !== '?' && config.default === undefined);
  const allowEmpty = config.nargs === '*' || config.nargs === '?' || config.const !== undefined || (positional && !required);
  const valuesCount = typeof config.nargs === 'number' ? config.nargs : undefined;
  const minValuesCount = Math.min(valuesCount ?? Infinity, allowEmpty ? 0 : 1);
  return { positional, multiple, required, allowEmpty, valuesCount, minValuesCount };
}
