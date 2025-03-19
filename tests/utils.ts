import SpyInstance = jest.SpyInstance;

type SpyFactory = () => SpyInstance;

export function usingSpies(factories: SpyFactory[], action: (...spies: SpyInstance[]) => void) {
  const spies = factories.map(context => context());
  try {
    action(...spies);
  } finally {
    spies.forEach(spy => spy.mockRestore());
  }
}

export function createExitSpy() {
  return jest.spyOn(process, 'exit')
    .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
}

export function createConsoleLogSpy() {
  return jest.spyOn(console, 'log').mockImplementation(() => {});
}

export function createConsoleErrorSpy() {
  return jest.spyOn(console, 'error').mockImplementation(() => {});
}
