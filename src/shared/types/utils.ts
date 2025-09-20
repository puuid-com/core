export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type PartialOmit<
  TObject extends Record<PropertyKey, unknown>,
  TKeys extends keyof TObject = never
> = Prettify<Partial<Omit<TObject, TKeys>> & Pick<TObject, TKeys>>;
