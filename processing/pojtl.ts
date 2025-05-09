// Wrapper for pojtl.kemdict.com, which is a wrapper for Ithuan's KeSi python library
// This is less work than porting the Python library to JS, and less hassle than
// directly setting up a Python workspace and calling Python via subprocesses.

let server = "https://pojtl.kemdict.com";
await fetch("http://127.0.0.1:8000")
  .then(() => {
    server = "http://127.0.0.1:8000";
  })
  .catch(() => {});

export async function toKIP(text: string) {
  const response = await fetch(`${server}/toTL`, {
    method: "POST",
    body: text,
  });
  return await response.text();
}

export async function toPOJ(text: string) {
  const response = await fetch(`${server}/toPOJ`, {
    method: "POST",
    body: text,
  });
  return await response.text();
}

/**
 * Convert `texts` to KIP in bulk.
 * `texts` are assumed to not have newlines. They are then concatenated with
 * newlines into one request, then the response is split on newlines again.
 * This saves on network overhead.
 */
export async function toKIPBulk(texts: string[]) {
  console.log(`Bulk converting ${texts[0]} and others to KIP...`);
  const bulkResult = await toKIP(texts.join("\n"));
  return bulkResult.split("\n");
}

/**
 * Convert `texts` to POJ in bulk.
 * `texts` are assumed to not have newlines. They are then concatenated with
 * newlines into one request, then the response is split on newlines again.
 * This saves on network overhead.
 */
export async function toPOJBulk(texts: string[]) {
  console.log(`Bulk converting ${texts[0]} and others to POJ...`);
  const bulkResult = await toPOJ(texts.join("\n"));
  return bulkResult.split("\n");
}
