import { it, expect } from "@jest/globals";
import { ArgsParser } from "../../src";

it('', async () => {
  const parser = new ArgsParser([
    {
      name: '--my-first-argument',
      alias: '-1',
      description: "My first argument",
      type: 'string',
      required: true,
      notEmpty: true,
      choices: ['test', 'dev', 'prod'],
      validator: (x: unknown) => String(x).length > 2,
    },
    {
      name: '--my-second-argument',
      alias: '-2',
      description: "My second argument",
      type: 'boolean',
      default: false,
    },
    {
      name: '--my-third-argument',
      alias: '-3',
      description: "My third argument",
      type: 'number',
      multiple: true,
      default: [0, 1],
    },
  ]);

  console.log(parser.help);

  const argsString = '--my-first-argument test -2 --my-third-argument 1 2 3';
  const parsedArgs = parser.parse(argsString);

  expect(parsedArgs.all).toEqual({
    'my-first-argument': 'test',
    'my-second-argument': true,
    'my-third-argument': [1, 2, 3],
  });

  const myFirstArgument = parsedArgs.get<string>('--my-first-argument');
  expect(myFirstArgument).toEqual('test');

  const mySecondArgument = parsedArgs.get<string>('--my-second-argument');
  expect(mySecondArgument).toEqual(true);

  const myThirdArgument = parsedArgs.get<string>('--my-third-argument');
  expect(myThirdArgument).toEqual([1, 2, 3]);
});
