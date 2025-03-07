import type {
  ArgType,
  ArgConfig,
  ParsedArgumentsCollectionInterface,
  ArgsParserInterface,
} from "./types";

import {
  ArgsParser,
  ParsedArgumentsCollection,
} from "./classes";

import {
  ArgsParserError,
  AddArgumentError,
  ArgumentNameError,
  ArgumentValueError,
} from "./exceptions";

export type {
  ArgType,
  ArgConfig,
  ParsedArgumentsCollectionInterface,
  ArgsParserInterface,
};

export {
  ArgsParser,
  ParsedArgumentsCollection,
  ArgsParserError,
  AddArgumentError,
  ArgumentNameError,
  ArgumentValueError,
}
