# Argument Parser for TypeScript

[![npm](https://img.shields.io/npm/v/argparse-ts.svg)](https://www.npmjs.com/package/argparse-ts)
[![npm](https://img.shields.io/npm/dm/argparse-ts.svg?style=flat)](https://www.npmjs.com/package/argparse-ts)
[![Coverage Status](https://coveralls.io/repos/github/Smoren/argparse-ts/badge.svg?branch=master&rand=222)](https://coveralls.io/github/Smoren/argparse-ts?branch=master)
![Build and test](https://github.com/Smoren/argparse-ts/actions/workflows/test.yml/badge.svg)
[![Minified Size](https://badgen.net/bundlephobia/minzip/argparse-ts)](https://bundlephobia.com/result?p=argparse-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Overview
--------

CLI arguments parser for node.js (TypeScript / JavaScript)

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
    name: '--my-first-argument',
    alias: '-1',
    type: 'string',
    required: true,
    notEmpty: true,
    allowedValues: ['test', 'dev', 'prod'],
    validator: (x: unknown) => String(x).length > 2,
  },
  {
    name: '--my-second-argument',
    alias: '-2',
    type: 'boolean',
    default: false,
  },
  {
    name: '--my-third-argument',
    alias: '-3',
    type: 'number',
    multiple: true,
    default: [0, 1],
  },
]);

const argsString = '--my-first-argument test -2 --my-third-argument 1 2 3';
const parsedArgs = parser.parse(argsString);

console.log(parsedArgs.all);
/*
{
  'my-first-argument': 'test',
  'my-second-argument': true,
  'my-third-argument': [1, 2, 3],
}
*/

const myFirstArgument = parsedArgs.get<string>('--my-first-argument');
console.log(myFirstArgument); // 'test'

const mySecondArgument = parsedArgs.get<string>('--my-second-argument');
console.log(mySecondArgument); // true

const myThirdArgument = parsedArgs.get<string>('--my-third-argument');
console.log(myThirdArgument); // [1, 2, 3]
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
