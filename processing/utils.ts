export function uniq<T>(arr: T[]) {
  const set = new Set<T>();
  for (const it of arr) {
    set.add(it);
  }
  return [...set];
}

/**
 * Return a generator of all elements in `arr` separated by `sep`.
 * Naming from dash.el.
 */
export function* interpose<Sep, Item>(sep: Sep, arr: Iterable<Item>) {
  let first = true;
  for (const item of arr) {
    if (first) {
      yield item;
      first = false;
    } else {
      yield sep;
      yield item;
    }
  }
}
