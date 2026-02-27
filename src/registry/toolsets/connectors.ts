import type { ToolsetDefinition } from "../types.js";
import { stripNulls, unwrapBody } from "../../utils/body-normalizer.js";

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

export const connectorsToolset: ToolsetDefinition = {
  name: "connectors",
  displayName: "Connectors",
  description: "Integration connectors (GitHub, Docker, AWS, GCP, etc.)",
  resources: [
    {
      resourceType: "connector",
      displayName: "Connector",
      description: "External integration connector. Supports full CRUD and test_connection.",
      toolset: "connectors",
      scope: "project",
      identifierFields: ["connector_id"],
      listFilterFields: ["search_term", "type", "category"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/setup/connectors/{connectorIdentifier}",
      operations: {
        list: {
          method: "GET",
          path: "/ng/api/connectors",
          queryParams: {
            search_term: "searchTerm",
            type: "type",
            category: "category",
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List connectors",
        },
        get: {
          method: "GET",
          path: "/ng/api/connectors/{connectorIdentifier}",
          pathParams: { connector_id: "connectorIdentifier" },
          responseExtractor: ngExtract,
          description: "Get connector details",
        },
        create: {
          method: "POST",
          path: "/ng/api/connectors",
          bodyBuilder: (input) => {
            const raw = unwrapBody(input.body, "connector") ?? input.body;
            const out = stripNulls(raw);
            return typeof out === "object" && out !== null ? out : raw;
          },
          responseExtractor: ngExtract,
          description: "Create a new connector",
        },
        update: {
          method: "PUT",
          path: "/ng/api/connectors",
          bodyBuilder: (input) => {
            let raw = unwrapBody(input.body, "connector") ?? input.body;
            if (typeof raw === "object" && raw !== null) {
              const r = raw as Record<string, unknown>;
              if ((r.connectionType === undefined || r.connectionType === null) && r.type) {
                r.connectionType = r.type;
              }
            }
            const out = stripNulls(raw);
            return typeof out === "object" && out !== null ? out : raw;
          },
          responseExtractor: ngExtract,
          description: "Update a connector",
        },
        delete: {
          method: "DELETE",
          path: "/ng/api/connectors/{connectorIdentifier}",
          pathParams: { connector_id: "connectorIdentifier" },
          responseExtractor: ngExtract,
          description: "Delete a connector",
        },
      },
      executeActions: {
        test_connection: {
          method: "POST",
          path: "/ng/api/connectors/testConnection/{connectorIdentifier}",
          pathParams: { connector_id: "connectorIdentifier" },
          bodyBuilder: () => ({}),
          responseExtractor: ngExtract,
          actionDescription: "Test connectivity of a connector",
        },
      },
    },
    {
      resourceType: "connector_catalogue",
      displayName: "Connector Catalogue",
      description: "Catalogue of available connector types. Supports list only.",
      toolset: "connectors",
      scope: "account",
      identifierFields: [],
      operations: {
        list: {
          method: "GET",
          path: "/ng/api/connectors/catalogue",
          responseExtractor: ngExtract,
          description: "List all available connector types in the catalogue",
        },
      },
    },
  ],
};
