import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Registry } from "../registry/index.js";
import type { HarnessClient } from "../client/harness-client.js";
import { jsonResult, errorResult } from "../utils/response-formatter.js";
import { toMcpError } from "../utils/errors.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("search");

export function registerSearchTool(server: McpServer, registry: Registry, client: HarnessClient): void {
  server.tool(
    "harness_search",
    "Search across multiple Harness resource types simultaneously. Runs parallel list queries with a search term across all specified (or all enabled) resource types.",
    {
      query: z.string().describe("Search term to find across resource types"),
      resource_types: z.array(z.string()).describe("Resource types to search (defaults to all listable types if empty)").optional(),
      org_id: z.string().describe("Organization identifier (overrides default)").optional(),
      project_id: z.string().describe("Project identifier (overrides default)").optional(),
      max_per_type: z.number().describe("Max results per resource type").default(5).optional(),
    },
    async (args) => {
      try {
        // Determine which resource types to search
        let targetTypes = args.resource_types ?? [];
        if (targetTypes.length === 0) {
          // Search all types that support list
          targetTypes = registry.getAllResourceTypes().filter((rt) => registry.supportsOperation(rt, "list"));
        }

        const results: Record<string, unknown> = {};
        const errors: Record<string, string> = {};

        // Run searches in parallel
        const promises = targetTypes.map(async (rt) => {
          try {
            const result = await registry.dispatch(client, rt, "list", {
              ...args,
              search_term: args.query,
              name: args.query,
              query: args.query,
              search: args.query,
              size: args.max_per_type ?? 5,
              limit: args.max_per_type ?? 5,
              page: 0,
            });
            return { rt, result, error: null };
          } catch (err) {
            log.debug(`Search failed for ${rt}`, { error: String(err) });
            return { rt, result: null, error: String(err) };
          }
        });

        const settled = await Promise.all(promises);
        for (const { rt, result, error } of settled) {
          if (result) {
            // Only include non-empty results
            const r = result as { items?: unknown[]; total?: number };
            if (r.items && r.items.length > 0) {
              results[rt] = result;
            } else if (!r.items) {
              // Raw response — include if non-null
              results[rt] = result;
            }
          }
          if (error) {
            errors[rt] = error;
          }
        }

        return jsonResult({
          query: args.query,
          searched_types: targetTypes,
          results,
          ...(Object.keys(errors).length > 0 ? { errors } : {}),
        });
      } catch (err) {
        if (err instanceof Error) {
          return errorResult(err.message);
        }
        throw toMcpError(err);
      }
    },
  );
}
