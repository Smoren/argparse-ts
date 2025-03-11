import type { ArgConfig, ArgType, NArgs } from "./types";

/**
 * Cast a string value to the given type.
 *
 * @param value The string value to cast.
 * @param type The type to cast the value to.
 * @param nargs The number of arguments.
 * @param defaultValue The default value if the value is empty.
 * @returns The cast value.
 *
 * @category Utils
 */
export function castArgValue(value: string, type: ArgType, nargs?: NArgs, defaultValue?: unknown): unknown {
  if (isNargsMultiple(nargs)) {
    const result = value.split(' ').filter((x) => x !== '').map((x) => castArgValue(x, type));
    if (typeof nargs === 'number' && result.length !== nargs) {

    }
    return result.length > 0 ? result : (defaultValue ?? []);
  }

  const _value = value !== '' ? value : (defaultValue ?? value);

  if (_value === undefined) {
    return _value;
  }

  switch (type) {
    case 'string': return _value;
    case 'number': return Number(_value);
    case 'boolean': return _value !== 'false' && _value !== '0';
  }
}

/**
 * Parse a string arguments to a plain object.
 *
 * @param argsString The string arguments.
 * @returns The parsed plain object.
 *
 * @category Utils
 */
export function parseArgsString(argsString: string): [string[], Record<string, string>] {
  const [positional, optional] = splitArgsString(formatArgsString(argsString));
  return [positional, Object.fromEntries(parseArgsArray(optional))];
}

/**
 * Generates help content for this argument.
 *
 * @param argConfig - The argument configuration.
 * @returns The help content.
 *
 * @category Utils
 */
export function formatArgHelp(argConfig: ArgConfig): [string, string][] {
  const result: [string, string][] = [];

  result.push([formatArgUsageExample(argConfig), argConfig.description ?? '<no description>']);
  result.push(['', `Type: ${formatArgType(argConfig)}`]);

  if (argConfig.default !== undefined) {
    result.push(['', `Default value: ${JSON.stringify(argConfig.default)}`]);
  }

  if (argConfig.choices !== undefined) {
    result.push(['', `Allowed values: ${argConfig.choices.join(', ')}`]);
  }

  return result;
}

/**
 * Converts a two-dimensional array of strings into a table.
 *
 * @param data The two-dimensional array of strings.
 * @param padding The amount of padding to add to each cell.
 * @returns The table as a string.
 *
 * @category Utils
 */
export function convertToTable(data: string[][], padding: number = 0): string {
  if (!data || data.length === 0) {
    return '';
  }

  const maxCols = Math.max(...data.map(row => row.length));

  const normalizedData = data.map(row =>
    row.concat(Array(maxCols - row.length).fill('')) // Добавляем пустые строки где нужно
  );

  const columnWidths: number[] = Array(maxCols).fill(0);
  for (let col = 0; col < maxCols; col++) {
    columnWidths[col] = Math.max(...normalizedData.map(row => (row[col]?.length || 0)));
  }

  const result: string[] = [];
  for (const row of normalizedData) {
    const rowString = row
      .map((cell, i) => cell.padEnd(columnWidths[i]+padding, ' ')) // Добавляем пробелы до максимальной длины
      .join(' '); // Разделитель
    result.push(rowString);
  }

  return result.join('\n');
}

/**
 * Generates a string representation of the argument type.
 *
 * @param argConfig - The argument configuration.
 * @returns The string representation of the argument type.
 *
 * @category Utils
 */
function formatArgType(argConfig: ArgConfig): string {
  let result = argConfig.multiple ? `Array<${argConfig.type}>` : argConfig.type;

  if (argConfig.notEmpty && argConfig.type !== 'boolean') {
    result += ' (not empty)';
  }

  return result;
}

/**
 * Generates an example of the argument usage.
 *
 * @param argConfig - The argument configuration.
 * @returns The example of the argument usage.
 *
 * @category Utils
 */
function formatArgUsageExample(argConfig: ArgConfig): string {
  let result = '';
  const argValueExample = formatArgValueExample(argConfig);

  if (argConfig.alias) {
    result += `${argConfig.alias}${argValueExample}, ${argConfig.name}${argValueExample}`;
  } else {
    result += `${argConfig.name}${argValueExample}`;
  }

  return result;
}

/**
 * Generates an example of the argument value.
 *
 * @param argConfig - The argument configuration.
 * @returns The example of the argument value.
 *
 * @category Utils
 */
function formatArgValueExample(argConfig: ArgConfig): string {
  if (argConfig.type === 'boolean' && !argConfig.multiple) {
    return '';
  }

  if (argConfig.multiple) {
    return ` <${argConfig.type}> <${argConfig.type}> ...`;
  }

  return ` <${argConfig.type}>`;
}

/**
 * Parse an array of string arguments to an array of tuples.
 *
 * @param args The array of string arguments.
 * @returns The parsed array of tuples.
 *
 * @category Utils
 */
function parseArgsArray(args: string[]): [string, string][] {
  return args
    .map((x) => x.split(/ (.+)/).slice(0, 2))
    .map((x) => x.length === 1 ? [x[0], ''] : x)
    .filter((x) => x[0] !== '') as [string, string][];
}

/**
 * Split an arguments string to an array of strings.
 *
 * @param argsString The string arguments.
 * @returns The split array of strings.
 *
 * @category Utils
 */
function splitArgsString(argsString: string): [string[], string[]] {
  const exploded = argsString.split(' -').map((x, i) => i === 0 ? x : `-${x}`);

  const positional = [];
  const optional = [];
  let positionalFinished = false;

  for (const x of exploded) {
    if (x.startsWith('-')) {
      positionalFinished = true;
    }

    if (positionalFinished) {
      optional.push(...x.split(' '));
    } else {
      positional.push(x);
    }
  }

  return [positional, optional];
}

/**
 * Format an arguments string.
 *
 * @param argsString The string arguments.
 * @returns The formatted string.
 *
 * @category Utils
 */
function formatArgsString(argsString: string): string {
  return argsString
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(-[A-Za-z0-9]{2,})/, (_, p) => ' '+formatGluedArgsString(p))
    .replace(/ (-[A-Za-z0-9]{2,})/, (_, p) => ' '+formatGluedArgsString(p))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format a glued arguments string.
 *
 * @param gluedArgsString The glued arguments string.
 * @returns The formatted string.
 *
 * @category Utils
 */
function formatGluedArgsString(gluedArgsString: string): string {
  return gluedArgsString.slice(1).split('').map((x) => `-${x}`).join(' ');
}

function isNargsMultiple(nargs?: NArgs): boolean {
  return nargs === '*' || nargs === '+' || typeof nargs === 'number';
}
