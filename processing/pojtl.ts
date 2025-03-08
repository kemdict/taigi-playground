// const server = "https://pojtl.kemdict.com";
const server = "http://127.0.0.1:8000";

/**
 * WIP: convert `text` to input form.
 * We can assume `text` is well-formed, for example:
 *   - Doesn't have multiple tones
 *   - Maybe even "it's a valid sequence already converted in inputToKIP or inputToPOJ"
 */
function toInputFormWIP(text: string) {
  const toneMap = [
    ["a", "1"],
    ["á", "2"],
    ["à", "3"],
    ["a", "4"],
    ["â", "5"],
    ["ǎ", "6"],
    ["ā", "7"],
    ["a̍", "8"],
    ["a̋", "9"],
  ];
  const normalized = text.normalize("NFD");
}

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
  const bulkResult = await toPOJ(texts.join("\n"));
  return bulkResult.split("\n");
}
