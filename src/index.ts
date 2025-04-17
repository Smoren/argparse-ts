import type {
  ArgType,
  NArgs,
  ArgConfig,
  ActionConfig,
  ArgParserConfig,
  ParsedArgumentsCollectionInterface,
  ArgsParserInterface,
  RouterInterface,
} from "./types";

import {
  ArgsParser,
  ParsedArgumentsCollection,
  Router,
} from "./classes";

import {
  ArgsParserException,
  ArgsParserError,
  ArgumentConfigError,
  ArgumentNameError,
  ArgumentValueError,
  StopException,
  isExceptionInstanceOf,
} from "./exceptions";

export type {
  ArgType,
  NArgs,
  ArgConfig,
  ActionConfig,
  ArgParserConfig,
  ParsedArgumentsCollectionInterface,
  ArgsParserInterface,
  RouterInterface,
};

export {
  ArgsParser,
  ParsedArgumentsCollection,
  Router,
  ArgsParserException,
  ArgsParserError,
  ArgumentConfigError,
  ArgumentNameError,
  ArgumentValueError,
  StopException,
  isExceptionInstanceOf,
}
