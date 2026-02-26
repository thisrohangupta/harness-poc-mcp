import type { ToolsetDefinition } from "../types.js";

const ngExtract = (raw: unknown) => {
  const r = raw as { data?: unknown };
  return r.data ?? raw;
};

const pageExtract = (raw: unknown) => {
  const r = raw as { data?: { content?: unknown[]; totalElements?: number } };
  return { items: r.data?.content ?? [], total: r.data?.totalElements ?? 0 };
};

export const secretsToolset: ToolsetDefinition = {
  name: "secrets",
  displayName: "Secrets",
  description: "Secret management (read-only metadata — values never exposed)",
  resources: [
    {
      resourceType: "secret",
      displayName: "Secret",
      description: "Secret metadata (name, type, scope). Values are NEVER returned. Read-only.",
      toolset: "secrets",
      scope: "project",
      identifierFields: ["secret_id"],
      listFilterFields: ["search_term", "type"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/setup/resources/secrets/{secretIdentifier}",
      operations: {
        list: {
          method: "POST",
          path: "/ng/api/v2/secrets/list",
          queryParams: {
            search_term: "searchTerm",
            page: "page",
            size: "size",
          },
          bodyBuilder: (input) => ({
            filterType: "Secret",
            secretTypes: input.type ? [input.type] : undefined,
          }),
          responseExtractor: pageExtract,
          description: "List secret metadata (values never exposed)",
        },
        get: {
          method: "GET",
          path: "/ng/api/v2/secrets/{secretIdentifier}",
          pathParams: { secret_id: "secretIdentifier" },
          responseExtractor: ngExtract,
          description: "Get secret metadata (value never exposed)",
        },
      },
    },
  ],
};
