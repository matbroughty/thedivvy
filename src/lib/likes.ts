const ABACUS_BASE = "https://abacus.jasoncameron.dev";
const NAMESPACE = "thedivvy";

export async function getLikes(slug: string): Promise<number> {
  try {
    const res = await fetch(`${ABACUS_BASE}/get/${NAMESPACE}/${slug}`);
    if (res.status === 404) return 0;
    if (!res.ok) return 0;
    const data = (await res.json()) as { value?: number };
    return typeof data.value === "number" ? data.value : 0;
  } catch {
    return 0;
  }
}

export async function incrementLikes(slug: string): Promise<number> {
  const res = await fetch(`${ABACUS_BASE}/hit/${NAMESPACE}/${slug}`);
  if (!res.ok) throw new Error(`Abacus hit failed: ${res.status}`);
  const data = (await res.json()) as { value?: number };
  return typeof data.value === "number" ? data.value : 0;
}

const storageKey = (slug: string) => `divvy:liked:${slug}`;

export function hasLiked(slug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(storageKey(slug)) === "1";
  } catch {
    return false;
  }
}

export function markLiked(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(slug), "1");
  } catch {
    // localStorage may be disabled / quota-exceeded; non-fatal
  }
}
