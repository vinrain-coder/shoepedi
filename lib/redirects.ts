const DEFAULT_REDIRECT_PATH = "/";

export function sanitizeRedirectPath(redirect?: string | null): string {
  if (!redirect) return DEFAULT_REDIRECT_PATH;

  const value = redirect.trim();
  if (!value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_REDIRECT_PATH;
  }

  return value;
}

export function toSignInPath(redirect?: string | null) {
  const target = sanitizeRedirectPath(redirect);
  return `/sign-in?redirect=${encodeURIComponent(target)}`;
}

export function toSignUpPath(redirect?: string | null) {
  const target = sanitizeRedirectPath(redirect);
  return `/sign-up?redirect=${encodeURIComponent(target)}`;
}
