import type { ToolsetDefinition } from "../types.js";

const ngExtract = (raw: unknown) => {
  const r = raw as { data?: unknown };
  return r.data ?? raw;
};

const pageExtract = (raw: unknown) => {
  const r = raw as { data?: { content?: unknown[]; totalElements?: number } };
  return { items: r.data?.content ?? [], total: r.data?.totalElements ?? 0 };
};

export const infrastructureToolset: ToolsetDefinition = {
  name: "infrastructure",
  displayName: "Infrastructure",
  description: "Infrastructure definitions for deployment targets",
  resources: [
    {
      resourceType: "infrastructure",
      displayName: "Infrastructure Definition",
      description: "Infrastructure definition within an environment. Supports full CRUD.",
      toolset: "infrastructure",
      scope: "project",
      identifierFields: ["infrastructure_id"],
      listFilterFields: ["environment_id", "search_term"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/environments",
      operations: {
        list: {
          method: "GET",
          path: "/ng/api/infrastructures",
          queryParams: {
            environment_id: "environmentIdentifier",
            search_term: "searchTerm",
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List infrastructure definitions",
        },
        get: {
          method: "GET",
          path: "/ng/api/infrastructures/{infraIdentifier}",
          pathParams: { infrastructure_id: "infraIdentifier" },
          queryParams: { environment_id: "environmentIdentifier" },
          responseExtractor: ngExtract,
          description: "Get infrastructure definition details",
        },
        create: {
          method: "POST",
          path: "/ng/api/infrastructures",
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Create infrastructure definition",
        },
        update: {
          method: "PUT",
          path: "/ng/api/infrastructures",
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Update infrastructure definition",
        },
        delete: {
          method: "DELETE",
          path: "/ng/api/infrastructures/{infraIdentifier}",
          pathParams: { infrastructure_id: "infraIdentifier" },
          queryParams: { environment_id: "environmentIdentifier" },
          responseExtractor: ngExtract,
          description: "Delete infrastructure definition",
        },
      },
      executeActions: {
        move_configs: {
          method: "POST",
          path: "/ng/api/infrastructures/move-config/{infraIdentifier}",
          pathParams: { infrastructure_id: "infraIdentifier" },
          queryParams: { environment_id: "environmentIdentifier" },
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          actionDescription: "Move infrastructure configuration (e.g., move inline config to remote or vice versa)",
        },
      },
    },
  ],
};
