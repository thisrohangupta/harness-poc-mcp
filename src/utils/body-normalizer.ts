/**
 * Normalize request bodies for Harness NG APIs.
 * - Strip null/undefined to avoid "Unable to process JSON" from invalid values.
 * - Unwrap common wrapper keys (environment, service, connector) when APIs expect the entity at top level.
 */

/** Recursively remove null and undefined so they are omitted from JSON. */
export function stripNulls(obj: unknown): unknown {
  if (obj === null || obj === undefined) return undefined;
  if (Array.isArray(obj)) return obj.map(stripNulls).filter((x) => x !== undefined);
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const v2 = stripNulls(v);
      if (v2 !== undefined) out[k] = v2;
    }
    return out;
  }
  return obj;
}

/** Return body[wrapperKey] if present, else body. Use when API expects the entity at top level. */
export function unwrapBody(body: unknown, wrapperKey: string): unknown {
  if (body !== null && typeof body === "object" && wrapperKey in (body as Record<string, unknown>)) {
    return (body as Record<string, unknown>)[wrapperKey];
  }
  return body;
}
