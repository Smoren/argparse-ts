import type { ArgType } from "./types";

/**
 * Cast a string value to the given type.
 *
 * @param value The string value to cast.
 * @param type The type to cast the value to.
 * @param multiple Whether the value is a multiple value.
 * @param defaultValue The default value if the value is empty.
 * @returns The cast value.
 *
 * @category Utils
 */
export function castArgValue(value: string, type: ArgType, multiple: boolean, defaultValue?: unknown): unknown {
  if (multiple) {
    const result = value.split(' ').filter((x) => x !== '').map((x) => castArgValue(x, type, false));
    return result.length > 0 ? result : defaultValue;
  }

  const _value = value !== '' ? value : (defaultValue ?? value);

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
export function parseArgsString(argsString: string): Record<string, string> {
  return Object.fromEntries(parseArgsArray(splitArgsString(formatArgsString(argsString))));
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
    .map((x) => x.length === 1 ? [x[0], ''] : x) as [string, string][];
}

/**
 * Split an arguments string to an array of strings.
 *
 * @param argsString The string arguments.
 * @returns The split array of strings.
 *
 * @category Utils
 */
function splitArgsString(argsString: string): string[] {
  return argsString.split(' -').map((x, i) => i === 0 ? x : `-${x}`);
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
