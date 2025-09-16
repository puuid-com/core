export function maxValueByKey<T>(arr: T[], key: keyof T): number | undefined {
  let m = undefined as number | undefined;
  for (const o of arr) {
    const v = o[key] as unknown as number;
    if (m === undefined || v > m) m = v;
  }
  return m;
}

export function maxItemByKey<T>(arr: T[], key: keyof T): T {
  if (arr.length === 0) {
    throw new Error("Array is empty");
  }

  let best = arr[0]!;
  let bestV = Number(best[key]);

  for (let i = 1; i < arr.length; i++) {
    const item = arr[i]!;

    const v = Number(item[key]);
    if (v > bestV) {
      best = item;
      bestV = v;
    }
  }

  return best;
}

export function maxItemBy<T>(arr: T[], predicate: (item: T) => number): T {
  if (arr.length === 0) {
    throw new Error("Array is empty");
  }

  let best = arr[0]!;
  let predicateV = predicate(best);

  for (let i = 1; i < arr.length; i++) {
    const item = arr[i]!;

    const v = predicate(item);
    if (v > predicateV) {
      best = item;
      predicateV = v;
    }
  }

  return best;
}

export function averageBy<T>(arr: T[], predicate: (item: T) => number): number {
  if (arr.length === 0) {
    throw new Error("Array is empty");
  }

  let sum = 0;

  for (const item of arr) {
    sum += predicate(item);
  }

  return sum / arr.length;
}
