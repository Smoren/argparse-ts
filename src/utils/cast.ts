import type { ArgConfigExtended, ValueCasterInterface } from "../types";

export function createValueCaster(argConfig: ArgConfigExtended): BaseValueCaster<unknown> {
  if (argConfig.multiple) {
    return new ArrayValueCaster(argConfig);
  }
  return createSingleValueCaster(argConfig);
}

function createSingleValueCaster(argConfig: ArgConfigExtended): BaseValueCaster<unknown> {
  switch (argConfig.type) {
    case 'string':
      return new StringValueCaster(argConfig);
    case 'number':
      return new NumberValueCaster(argConfig);
    case 'boolean':
      return new BooleanValueCaster(argConfig);
  }
}

abstract class BaseValueCaster<T> implements ValueCasterInterface<T> {
  protected argConfig: ArgConfigExtended;

  constructor(config: ArgConfigExtended) {
    this.argConfig = config;
  }

  public cast(value: string[], isset: boolean): T | undefined {
    if (!isset) {
      return this.argConfig.default as T;
    }

    if (value.length === 0) {
      return this.argConfig.const as T;
    }

    return undefined;
  }
}

abstract class SingleValueCaster<T extends boolean | number | string> extends BaseValueCaster<T> {
  public cast(value: string[], isset: boolean): T | undefined {
    const baseCasted = super.cast(value, isset);
    if (baseCasted !== undefined) {
      return baseCasted;
    }
    return this.castInternal(this.getSingleValue(value));
  }

  protected getSingleValue(value: string[]): string | undefined {
    return value[0] ?? undefined;
  }

  protected abstract castInternal(value?: string): T | undefined;
}

class StringValueCaster extends SingleValueCaster<string> {
  protected castInternal(value?: string): string | undefined {
    return value !== undefined ? String(value) : undefined;
  }
}

class NumberValueCaster extends SingleValueCaster<number> {
  protected castInternal(value?: string): number | undefined {
    return value !== undefined ? Number(value) : undefined;
  }
}

class BooleanValueCaster extends SingleValueCaster<boolean> {
  protected castInternal(value?: string): boolean | undefined {
    return value !== undefined ? !['false', '0'].includes(value) : undefined;
  }
}

class ArrayValueCaster<T> extends BaseValueCaster<T[]> {
  protected itemCaster: BaseValueCaster<T>;

  constructor(config: ArgConfigExtended) {
    super(config);
    this.itemCaster = createSingleValueCaster(config) as BaseValueCaster<T>;
  }

  public cast(value: string[], isset: boolean): T[] | undefined {
    const baseCasted = super.cast(value, isset);
    if (baseCasted !== undefined && baseCasted.length > 0) {
      return baseCasted;
    }
    if (value.length === 0 && !isset && !this.argConfig.positional) {
      return undefined;
    }
    return value.map((v) => this.itemCaster.cast([v], isset)!);
  }
}
