type AG<T, R> = AsyncGenerator<T, R, void>;

export function pipeStep<T, R>(gen: AG<T, R>) {
  let resolveResult!: (r: R) => void;
  const result = new Promise<R>((r) => (resolveResult = r));

  const stream = (async function* (): AsyncGenerator<T, void, void> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      const { value, done } = await gen.next();
      if (done) {
        resolveResult(value);
        return;
      }
      yield value;
    }
  })();

  return { stream, result };
}
