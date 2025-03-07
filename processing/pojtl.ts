// const server = "https://pojtl.kemdict.com";
const server = "http://127.0.0.1:8000";

export async function toTL(text: string) {
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
 * Convert `texts` to TL in bulk.
 * `texts` are assumed to not have newlines. They are then concatenated with
 * newlines into one request, then the response is split on newlines again.
 * This saves on network overhead.
 */
export async function toTLBulk(texts: string[]) {
  const bulkResult = await toTL(texts.join("\n"));
  return bulkResult.split("\n");
}

/**
 * Convert `texts` to POJ in bulk.
 * `texts` are assumed to not have newlines. They are then concatenated with
 * newlines into one request, then the response is split on newlines again.
 * This saves on network overhead.
 */
export async function toPOJBulk(texts: string[]) {
  const bulkResult = await toPOJ(texts.join("\n"));
  return bulkResult.split("\n");
}
