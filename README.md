# Argument Parser for TypeScript

[![npm](https://img.shields.io/npm/v/argparse-ts.svg)](https://www.npmjs.com/package/argparse-ts)
[![npm](https://img.shields.io/npm/dm/argparse-ts.svg?style=flat)](https://www.npmjs.com/package/argparse-ts)
[![Coverage Status](https://coveralls.io/repos/github/Smoren/argparse-ts/badge.svg?branch=master&rand=222)](https://coveralls.io/github/Smoren/argparse-ts?branch=master)
![Build and test](https://github.com/Smoren/argparse-ts/actions/workflows/test.yml/badge.svg)
[![Minified Size](https://badgen.net/bundlephobia/minzip/argparse-ts)](https://bundlephobia.com/result?p=argparse-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Overview
--------

Modern CLI arguments parser for node.js (TypeScript / JavaScript).

Setup
-----

```bash
npm i argparse-ts
```

Usage example
-------------

```typescript
import { ArgsParser } from "argparse-ts";

const parser = new ArgsParser([
  {
    name: 'positional-first',
    description: "My first positional argument",
    type: 'string',
    choices: ['test', 'dev', 'prod'],
  },
  {
    name: 'positional-second',
    description: "My first positional argument",
    type: 'number',
  },
  {
    name: '--optional-first',
    alias: '-1',
    description: "My first optional argument",
    type: 'string',
    nargs: '?',
    choices: ['test', 'dev', 'prod'],
    validator: (x: unknown) => String(x).length > 2,
  },
  {
    name: '--optional-second',
    alias: '-2',
    description: "My second optional argument",
    type: 'boolean',
    default: false,
  },
  {
    name: '--optional-third',
    alias: '-3',
    description: "My third optional argument",
    type: 'number',
    nargs: '*',
    default: [0, 1],
  },
  {
    name: '--optional-const',
    alias: '-c',
    description: "My const optional argument",
    type: 'boolean',
    const: true,
    default: false,
  },
]);

console.log(parser.help);
/*
Positional arguments:

    positional-first <string>   My first positional argument
                                Type: string (not empty)
                                Allowed values: test, dev, prod

    positional-second <number>  My first positional argument
                                Type: number (not empty)

Optional arguments:

    -1 <string>, --optional-first <string>
                                My first optional argument
                                Type: string
                                Allowed values: test, dev, prod

    -2, --optional-second       My second optional argument
                                Type: boolean
                                Default value: false

    -3 <number> <number> ..., --optional-third <number> <number> ...
                                My third optional argument
                                Type: Array<number>
                                Default value: [0,1]

    -c, --optional-const        My const optional argument
                                Type: boolean
                                Default value: false
*/

const argsString = 'dev 123 --optional-first test -2 --optional-third 1 2 3 --optional-const';
const parsedArgs = parser.parse(argsString);

console.log(parsedArgs.positional);
/*
{
  'positional-first': 'dev',
  'positional-second': 123,
}
*/

console.log(parsedArgs.optional);
/*
{
  'optional-first': 'test',
  'optional-second': true,
  'optional-third': [1, 2, 3],
  'optional-const': true,
}
*/

{
  const value = parsedArgs.get<string>('positional-first');
  console.log(value); // 'dev'
}
{
  const value = parsedArgs.get<string>('positional-second');
  console.log(value); // 123
}
{
  const value = parsedArgs.get<string | undefined>('--optional-first');
  console.log(value); // 'test'
}
{
  const value = parsedArgs.get<boolean>('--optional-second');
  console.log(value); // true
}
{
  const value = parsedArgs.get<number[]>('--optional-third');
  console.log(value); // [1, 2, 3]
}
{
  const value = parsedArgs.get<boolean>('--optional-const');
  console.log(value); // true
}
```

Api Reference
-------------

For detailed documentation and usage examples, please refer to [API documentation](https://smoren.github.io/argparse-ts/)

Unit testing
------------

```bash
npm i
npm run test
```

License
-------

ArgParse TS is licensed under the MIT License.
