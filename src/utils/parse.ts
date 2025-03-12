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
  return [positional, Object.fromEntries(parseArgsArrayInternal(optional))];
}

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
 * Parse an array of string arguments to an array of tuples.
 *
 * @param args The array of string arguments.
 * @returns The parsed array of tuples.
 *
 * @category Utils
 */
function parseArgsArrayInternal(args: string[]): [string, string][] {
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
      optional.push(x);
    } else {
      positional.push(...x.split(' ').filter((x) => x !== ''));
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
