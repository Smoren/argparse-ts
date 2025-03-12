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

// function parseStringNew(argsString: string): [string[], string[]] {
//   const positional = [];
//   const optional = [];
//
//   let quotedBy: undefined | string = undefined;
//   //let optionalStarted =
//
//   for (const ch of argsString) {
//     if (quotedBy !== undefined && quotedBy === ch) {
//       quotedBy = undefined;
//     }
//
//     if (quotedBy === undefined && (ch === "'" || ch === '"')) {
//       quotedBy = ch;
//     }
//   }
// }
