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
