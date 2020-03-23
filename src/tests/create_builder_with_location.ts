type Builder<K extends string, T> = { [C in K]: (...args: any[]) => T };

type BuiltValue<B> = B extends Builder<string, infer T> ? T : never;

export function createBuilderWithLocation<B extends Builder<string, any>>(
  builder: B,
  location: any
): { [K in keyof B]: (...args: any[]) => BuiltValue<B> } {
  return new Proxy(
    {},
    {
      get(_: any, prop: keyof B) {
        if (prop in builder) {
          return (...args: any[]) => builder[prop](...args, location);
        }
        throw new TypeError(`no builder with name ${prop}`);
      },
    }
  );
}
