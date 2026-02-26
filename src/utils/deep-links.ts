/**
 * Build Harness UI deep-link URLs.
 */
export function buildDeepLink(
  baseUrl: string,
  accountId: string,
  template: string,
  params: Record<string, string>,
): string {
  let url = template;
  url = url.replace("{accountId}", accountId);
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, encodeURIComponent(value));
  }
  // Ensure base URL doesn't double-slash
  const base = baseUrl.replace(/\/$/, "");
  return `${base}${url}`;
}
