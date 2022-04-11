export function multipartition<Item>(
  set: Array<Item>,
  keyFunc: (item: Item) => ArrayLike<string>,
  expected: Array<string>
): Object {
  const partitions: Map<string, Set<Item>> = new Map();
  expected.forEach((key) => {
    partitions.set(key, new Set());
  });

  set.forEach((item) => {
    if (Array.from(keyFunc(item)).some((key) => !expected.includes(key))) {
      throw new Error(
        `Unexpected one of the following key \`${keyFunc(
          item
        )}\` during multi-partitioning`
      );
    }
    Array.from(keyFunc(item)).forEach((key) => {
      const s = partitions.get(key);
      if (s != null) {
        s.add(item);
      }
    });
  });

  // Convert all Array-like objects to proper Array.
  return Object.fromEntries(
    Object.entries(partitions).map(([k, v]) => [k, Array.from(v)])
  );
}
