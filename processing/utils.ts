/**
 * Use multiple "threads" of `body` to iterate through `iterable`.
 * `body` receives two inputs: the value coming out of the iterator, and an index.
 */
export async function forMulti<T>(
  iterable: Iterable<T>,
  body: (input: T, index: number) => any,
): Promise<void> {
  const iterator = iterable[Symbol.iterator]();
  // we add before running body so the number going up does not have to wait for
  // body to finish
  // but then to make the first iteration see 0 we have to start at -1
  let i = -1;
  await Promise.all(
    // With a normal (for .. of array) we retrieve a value, do stuff, retrieve
    // the next one, do stuff, etc.
    // By grabbing the iterator (one single object to keep track of where we
    // are) we can have multiple instances of the loop do stuff
    // concurrently, while staying synchronized in the value they're retrieving.
    [...Array(16).keys()].map(async () => {
      let next = iterator.next();
      while (!next.done) {
        i++; // do this as early as possible
        await body(next.value, i);
        next = iterator.next();
      }
    }),
  );
}
