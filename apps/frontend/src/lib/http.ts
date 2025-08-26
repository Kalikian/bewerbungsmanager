// Robust JSON parsing for fetch responses.
export async function parseJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
