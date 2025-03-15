import type {
  ArgType,
  NArgs,
  ArgConfig,
  ArgParserConfig,
  ParsedArgumentsCollectionInterface,
  ArgsParserInterface,
} from "./types";

import {
  ArgsParser,
  ParsedArgumentsCollection,
} from "./classes";

import {
  ArgsParserException,
  ArgumentConfigError,
  ArgumentNameError,
  ArgumentValueError,
  StopException,
} from "./exceptions";

export type {
  ArgType,
  NArgs,
  ArgConfig,
  ArgParserConfig,
  ParsedArgumentsCollectionInterface,
  ArgsParserInterface,
};

export {
  ArgsParser,
  ParsedArgumentsCollection,
  ArgsParserException,
  ArgumentConfigError,
  ArgumentNameError,
  ArgumentValueError,
  StopException,
}
