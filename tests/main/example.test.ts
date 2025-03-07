import { it } from "@jest/globals";
import { ArgsParser } from "../../src";

it('', async () => {
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
      required: true,
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

  expect(parsedArgs.all).toEqual({
    'my-first-argument': 'test',
    'my-second-argument': true,
    'my-third-argument': [1, 2, 3],
  });

  const myFirstArgument = parsedArgs.get<string | undefined>('--my-first-argument');
  expect(myFirstArgument).toEqual('test');

  const mySecondArgument = parsedArgs.get<string | undefined>('--my-second-argument');
  expect(mySecondArgument).toEqual(true);

  const myThirdArgument = parsedArgs.get<string | undefined>('--my-third-argument');
  expect(myThirdArgument).toEqual([1, 2, 3]);
});
