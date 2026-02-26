import type { ToolsetDefinition } from "../types.js";

const ngExtract = (raw: unknown) => {
  const r = raw as { data?: unknown };
  return r.data ?? raw;
};

const pageExtract = (raw: unknown) => {
  const r = raw as { data?: { content?: unknown[]; totalElements?: number } };
  return {
    items: r.data?.content ?? [],
    total: r.data?.totalElements ?? 0,
  };
};

export const environmentsToolset: ToolsetDefinition = {
  name: "environments",
  displayName: "Environments",
  description: "Deployment target environments (dev, staging, prod, etc.)",
  resources: [
    {
      resourceType: "environment",
      displayName: "Environment",
      description: "Deployment target environment. Supports full CRUD.",
      toolset: "environments",
      scope: "project",
      identifierFields: ["environment_id"],
      listFilterFields: ["search_term", "env_type", "sort"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/environments/{environmentIdentifier}",
      operations: {
        list: {
          method: "GET",
          path: "/ng/api/environmentsV2",
          queryParams: {
            search_term: "searchTerm",
            env_type: "envType",
            sort: "sort",
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List environments in a project",
        },
        get: {
          method: "GET",
          path: "/ng/api/environmentsV2/{environmentIdentifier}",
          pathParams: { environment_id: "environmentIdentifier" },
          responseExtractor: ngExtract,
          description: "Get environment details",
        },
        create: {
          method: "POST",
          path: "/ng/api/environmentsV2",
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Create a new environment",
        },
        update: {
          method: "PUT",
          path: "/ng/api/environmentsV2",
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Update an existing environment",
        },
        delete: {
          method: "DELETE",
          path: "/ng/api/environmentsV2/{environmentIdentifier}",
          pathParams: { environment_id: "environmentIdentifier" },
          responseExtractor: ngExtract,
          description: "Delete an environment",
        },
      },
      executeActions: {
        move_configs: {
          method: "POST",
          path: "/ng/api/environmentsV2/move-config/{environmentIdentifier}",
          pathParams: { environment_id: "environmentIdentifier" },
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          actionDescription: "Move environment configuration (e.g., move inline config to remote or vice versa)",
        },
      },
    },
  ],
};
