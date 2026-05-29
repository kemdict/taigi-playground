// Wrapper for kesi.ts, a port of Ithuan's KeSi python library.
// The port is experimental.

import { Ku } from "@kemdict/kesi";

export async function toKIP(text: string) {
  return new Ku(text).KIP().hanlo;
}

export async function toPOJ(text: string) {
  return new Ku(text).POJ().hanlo;
}

/**
 * Convert `texts` to KIP in bulk.
 * `texts` are assumed to not have newlines. They are then concatenated with
 * newlines into one request, then the response is split on newlines again.
 * This saves on network overhead.
 */
export async function toKIPBulk(texts: string[]) {
  // console.log(`Bulk converting ${texts[0]} and others to KIP...`);
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
  // console.log(`Bulk converting ${texts[0]} and others to POJ...`);
  const bulkResult = await toPOJ(texts.join("\n"));
  return bulkResult.split("\n");
}
