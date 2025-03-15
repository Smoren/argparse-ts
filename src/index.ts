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
  ArgsParserError,
  ArgumentConfigError,
  ArgumentNameError,
  ArgumentValueError,
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
  ArgsParserError,
  ArgumentConfigError,
  ArgumentNameError,
  ArgumentValueError,
}
