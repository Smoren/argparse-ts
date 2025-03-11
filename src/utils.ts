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


function isNargsMultiple(nargs?: NArgs): boolean {
  return nargs === '*' || nargs === '+' || typeof nargs === 'number';
}
