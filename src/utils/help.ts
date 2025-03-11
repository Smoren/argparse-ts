import { ArgConfig, NArgsConfig } from "../types";

/**
 * Generates a help message for an argument.
 *
 * @param argConfig - The argument configuration.
 * @param nargsConfig - The nargs configuration.
 *
 * @returns A 2D array of strings representing the help message.
 *
 * @category Utils
 */
export function formatArgHelp(argConfig: ArgConfig, nargsConfig: NArgsConfig): string[][] {
  const result: string[][] = [];
  const argUsageExample = formatArgUsageExample(argConfig, nargsConfig);

  if (argUsageExample.length > 30) {
    result.push([argUsageExample]);
    result.push(['', argConfig.description ?? '<no description>']);
  } else {
    result.push([argUsageExample, argConfig.description ?? '<no description>']);
  }

  result.push(['', `Type: ${formatArgType(argConfig, nargsConfig)}`]);

  if (argConfig.default !== undefined) {
    result.push(['', `Default value: ${JSON.stringify(argConfig.default)}`]);
  }

  if (argConfig.choices !== undefined) {
    result.push(['', `Allowed values: ${argConfig.choices.join(', ')}`]);
  }

  result.push(['']);

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

  const columnWidths: number[] = Array(maxCols).fill(0);
  for (let col = 0; col < maxCols; col++) {
    columnWidths[col] = Math.max(...data.map(row => {
      const len = row[col]?.length || 0;
      return row.length === 1 ? 0 : len;
    }));
  }

  const result: string[] = [];
  for (const row of data) {
    const rowString = row
      .map((cell, i) => cell.padEnd(columnWidths[i]+padding, ' ')) // Добавляем пробелы до максимальной длины
      .join(' '); // Разделитель
    result.push(rowString);
  }

  return result.join('\n');
}

/**
 * Converts an argument type into a string representation.
 *
 * @param argConfig - The argument configuration.
 * @param nargsConfig - The nargs configuration.
 *
 * @returns A string representation of the argument type.
 *
 * @category Utils
 */
function formatArgType(argConfig: ArgConfig, nargsConfig: NArgsConfig): string {
  let result = nargsConfig.multiple ? `Array<${argConfig.type}>` : argConfig.type;

  if (!nargsConfig.allowEmpty && argConfig.type !== 'boolean') {
    result += ' (not empty)';
  }

  return result;
}

/**
 * Generates a usage example string for an argument.
 *
 * @param argConfig - The argument configuration.
 * @param nargsConfig - The nargs configuration.
 *
 * @returns A string representing the usage example for the argument.
 *
 * @category Utils
 */
function formatArgUsageExample(argConfig: ArgConfig, nargsConfig: NArgsConfig): string {
  let result = '';
  const argValueExample = formatArgValueExample(argConfig, nargsConfig);

  if (argConfig.alias) {
    result += `${argConfig.alias}${argValueExample}, ${argConfig.name}${argValueExample}`;
  } else {
    result += `${argConfig.name}${argValueExample}`;
  }

  return result;
}

/**
 * Formats a table of strings into a tabbed format.
 *
 * @param rows - The 2D array of strings to format.
 * @param tabber - The tab character to use. Defaults to a standard tab.
 *
 * @returns The formatted strings.
 *
 * @category Utils
 */
export function tabTableRows(rows: string[][], tabber: string = "\t"): string[][] {
  return rows.map((row) => row.length ? [`${tabber}${row[0]}`, ...row.slice(1)] : []);
}

/**
 * Generates a value example string for an argument.
 *
 * @param argConfig - The argument configuration.
 * @param nargsConfig - The nargs configuration.
 *
 * @returns A string representing the value example for the argument.
 *
 * @category Utils
 */
function formatArgValueExample(argConfig: ArgConfig, nargsConfig: NArgsConfig): string {
  if (argConfig.type === 'boolean' && !nargsConfig.multiple) {
    return '';
  }

  if (nargsConfig.multiple) {
    return ` <${argConfig.type}> <${argConfig.type}> ...`;
  }

  return ` <${argConfig.type}>`;
}
