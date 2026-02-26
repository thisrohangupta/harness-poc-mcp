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

export const servicesToolset: ToolsetDefinition = {
  name: "services",
  displayName: "Services",
  description: "Harness service entities representing deployable workloads",
  resources: [
    {
      resourceType: "service",
      displayName: "Service",
      description: "Deployable service/workload definition. Supports full CRUD.",
      toolset: "services",
      scope: "project",
      identifierFields: ["service_id"],
      listFilterFields: ["search_term", "sort"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/services/{serviceIdentifier}",
      operations: {
        list: {
          method: "GET",
          path: "/ng/api/servicesV2",
          queryParams: {
            search_term: "searchTerm",
            sort: "sort",
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List services in a project",
        },
        get: {
          method: "GET",
          path: "/ng/api/servicesV2/{serviceIdentifier}",
          pathParams: { service_id: "serviceIdentifier" },
          responseExtractor: ngExtract,
          description: "Get service details",
        },
        create: {
          method: "POST",
          path: "/ng/api/servicesV2",
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Create a new service",
        },
        update: {
          method: "PUT",
          path: "/ng/api/servicesV2",
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Update an existing service",
        },
        delete: {
          method: "DELETE",
          path: "/ng/api/servicesV2/{serviceIdentifier}",
          pathParams: { service_id: "serviceIdentifier" },
          responseExtractor: ngExtract,
          description: "Delete a service",
        },
      },
    },
  ],
};
