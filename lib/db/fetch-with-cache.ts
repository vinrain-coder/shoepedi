import { connectToDatabase } from "@/lib/db";

// In-memory cache store
const cacheStore: Record<
  string,
  { data: any; lastFetched: number; fetching?: Promise<any> }
> = {};

const DEFAULT_CACHE_TTL = 10_000; // 10 seconds

export type QueryFn<T> = () => Promise<T | null>;

export async function fetchWithCache<T>({
  key,
  queryFn,
  ttl = DEFAULT_CACHE_TTL,
  fallback = null,
}: {
  key: string;
  queryFn: QueryFn<T>;
  ttl?: number;
  fallback?: T | null;
}): Promise<T | null> {
  const now = Date.now();
  const cached = cacheStore[key];

  // Serve cached value if still valid
  if (cached && now - cached.lastFetched < ttl) {
    // Stale-while-revalidate
    if (!cached.fetching && now - cached.lastFetched >= ttl) {
      cached.fetching = queryFn()
        .then((data) => {
          if (data) {
            cacheStore[key] = { data, lastFetched: Date.now() };
          }
          return data;
        })
        .finally(() => {
          cached.fetching = undefined;
        });
    }
    return cached.data;
  }

  // No cache or expired → fetch from DB
  try {
    await connectToDatabase();
    const data = await queryFn();

    if (data) {
      cacheStore[key] = { data, lastFetched: Date.now() };
      return data;
    }

    // Return fallback if query returned null
    return fallback;
  } catch (err) {
    console.error(`Error fetching ${key}:`, err);
    if (cached) return cached.data; // return last cached data
    return fallback;
  }
}
