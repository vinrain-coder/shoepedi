const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export const hitTrackingLookupLimit = (key: string) => {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  current.count += 1;
  store.set(key, current);
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: MAX_REQUESTS_PER_WINDOW - current.count,
  };
};
