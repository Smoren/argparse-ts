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
    name: 'container',
    description: "Container name",
    type: 'string',
  },
  {
    name: 'operations',
    description: "Operations to run",
    type: 'string',
    nargs: '+',
    choices: ['build', 'clear', 'sync', 'start', 'stop'],
  },
  {
    name: '--mode',
    description: "Run mode",
    type: 'string',
    nargs: '?',
    choices: ['dev', 'test', 'prod'],
    default: 'prod',
  },
  {
    name: '--cpu',
    description: "CPU cores count to use",
    type: 'number',
    nargs: '?',
    default: 1,
  },
  {
    name: '--use-gpu',
    description: "Use GPU flag",
    type: 'boolean',
    const: true,
    default: false,
  },
  {
    name: '--extra-services',
    alias: '-e',
    description: "Extra services to include",
    type: 'string',
    nargs: '*',
  },
]);

console.log(parser.help);

/*
Positional arguments:

    container <string>  Container name
                        Type: string (not empty)

    operations <string> <string> ...
                        Operations to run
                        Type: Array<string> (not empty)
                        Allowed values: build, clear, sync, start, stop

Optional arguments:

    --mode <string>     Run mode
                        Type: string
                        Default value: "prod"
                        Allowed values: dev, test, prod

    --cpu <number>      CPU cores count to use
                        Type: number
                        Default value: 1

    --use-gpu           Use GPU flag
                        Type: boolean
                        Default value: false

    -e <string> <string> ..., --extra-services <string> <string> ...
                        Extra services to include
                        Type: Array<string>
*/

const argv = ['main', 'clear', 'build', 'start', 'sync', '--mode', 'dev', '--use-gpu', '-e', 'logger', 'profiler', 'tester'];
const parsedArgs = parser.parse(argv);

console.log(parsedArgs.positional);
/*
{
  'container': 'main',
  'operations': ['clear', 'build', 'start', 'sync'],
}
*/

console.log(parsedArgs.optional);
/*
{
  'mode': 'dev',
  'cpu': 1,
  'use-gpu': true,
  'extra-services': ['logger', 'profiler', 'tester'],
}
*/

const containerName = parsedArgs.get<string>('container');
console.log(containerName); // 'main'

const operations = parsedArgs.get<string[]>('operations');
console.log(operations); // ['clear', 'build', 'start', 'sync']

const mode = parsedArgs.get<string>('--mode');
console.log(mode); // dev

const cpuCount = parsedArgs.get<number>('--cpu');
console.log(cpuCount); // 1

const useGpu = parsedArgs.get<boolean>('--use-gpu');
console.log(useGpu); // true
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
