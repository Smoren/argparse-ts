import { ArgsParserInterface } from "../types";
import { StopException } from "../exceptions";
import { ParsedArgumentsCollection } from "../classes";

export function helpAction(_: unknown, _1: ParsedArgumentsCollection, parser: ArgsParserInterface) {
  console.log(parser.help);
  throw new StopException();
}

export function versionAction(_: unknown, _1: ParsedArgumentsCollection, parser: ArgsParserInterface) {
  console.log(parser.config.version ?? 'No version specified');
  throw new StopException();
}
