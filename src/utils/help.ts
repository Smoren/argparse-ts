import { ArgConfig, NArgsConfig } from "../types";

export function formatArgHelp(argConfig: ArgConfig, nargsConfig: NArgsConfig): [string, string][] {
  const result: [string, string][] = [];

  result.push([formatArgUsageExample(argConfig, nargsConfig), argConfig.description ?? '<no description>']);
  result.push(['', `Type: ${formatArgType(argConfig, nargsConfig)}`]);

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

function formatArgType(argConfig: ArgConfig, nargsConfig: NArgsConfig): string {
  let result = nargsConfig.multiple ? `Array<${argConfig.type}>` : argConfig.type;

  if (!nargsConfig.allowEmpty && argConfig.type !== 'boolean') {
    result += ' (not empty)';
  }

  return result;
}

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

function formatArgValueExample(argConfig: ArgConfig, nargsConfig: NArgsConfig): string {
  if (argConfig.type === 'boolean' && !nargsConfig.multiple) {
    return '';
  }

  if (nargsConfig.multiple) {
    return ` <${argConfig.type}> <${argConfig.type}> ...`;
  }

  return ` <${argConfig.type}>`;
}
