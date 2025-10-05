type IdKeyOf<T> = {
  [P in keyof T]-?: T[P] extends PropertyKey ? P : never;
}[keyof T];

export function symmetricDiffById<T, K extends IdKeyOf<T>>(
  a: readonly T[],
  b: readonly T[],
  idKey: K
): T[] {
  const onlyA = a.filter((x) => !b.some((y) => y[idKey] === x[idKey]));
  const onlyB = b.filter((x) => !a.some((y) => y[idKey] === x[idKey]));
  return [...onlyA, ...onlyB];
}
