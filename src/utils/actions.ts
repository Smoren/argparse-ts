import { ArgsParserInterface } from "../types";
import { StopException } from "../exceptions";

export function helpAction(_: unknown, parser: ArgsParserInterface) {
  console.log(parser.help);
  throw new StopException();
}

export function versionAction(_: unknown, parser: ArgsParserInterface) {
  console.log(parser.config.version ?? 'No version specified');
  throw new StopException();
}
