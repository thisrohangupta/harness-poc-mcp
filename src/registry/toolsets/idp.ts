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

export const idpToolset: ToolsetDefinition = {
  name: "idp",
  displayName: "Internal Developer Portal",
  description: "Harness IDP — service catalog entities, scorecards, checks, and workflows",
  resources: [
    {
      resourceType: "idp_entity",
      displayName: "IDP Entity",
      description: "Internal Developer Portal catalog entity. Supports list and get.",
      toolset: "idp",
      scope: "account",
      identifierFields: ["entity_id"],
      listFilterFields: ["kind", "search"],
      deepLinkTemplate: "/ng/account/{accountId}/idp/catalog",
      operations: {
        list: {
          method: "GET",
          path: "/idp/api/catalog/entities",
          queryParams: {
            kind: "kind",
            search: "search",
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List IDP catalog entities",
        },
        get: {
          method: "GET",
          path: "/idp/api/catalog/entities/{entityId}",
          pathParams: { entity_id: "entityId" },
          responseExtractor: ngExtract,
          description: "Get IDP catalog entity details",
        },
      },
    },
    {
      resourceType: "scorecard",
      displayName: "Scorecard",
      description: "IDP scorecard for tracking developer standards. Supports list and get.",
      toolset: "idp",
      scope: "account",
      identifierFields: ["scorecard_id"],
      deepLinkTemplate: "/ng/account/{accountId}/idp/scorecards/{scorecardIdentifier}",
      operations: {
        list: {
          method: "GET",
          path: "/idp/api/scorecards",
          queryParams: {
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List IDP scorecards",
        },
        get: {
          method: "GET",
          path: "/idp/api/scorecards/{scorecardIdentifier}",
          pathParams: { scorecard_id: "scorecardIdentifier" },
          responseExtractor: ngExtract,
          description: "Get scorecard details",
        },
      },
    },
    {
      resourceType: "scorecard_check",
      displayName: "Scorecard Check",
      description: "Individual check within an IDP scorecard. Supports list and get.",
      toolset: "idp",
      scope: "account",
      identifierFields: ["check_id"],
      operations: {
        list: {
          method: "GET",
          path: "/idp/api/scorecards/checks",
          queryParams: {
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List scorecard checks",
        },
        get: {
          method: "GET",
          path: "/idp/api/scorecards/checks/{checkIdentifier}",
          pathParams: { check_id: "checkIdentifier" },
          responseExtractor: ngExtract,
          description: "Get scorecard check details",
        },
      },
    },
    {
      resourceType: "idp_score",
      displayName: "IDP Score",
      description: "Entity score summary from IDP scorecards. Supports list and get.",
      toolset: "idp",
      scope: "account",
      identifierFields: ["entity_id"],
      operations: {
        list: {
          method: "GET",
          path: "/idp/api/scorecards/scores",
          queryParams: {
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List entity scores",
        },
        get: {
          method: "GET",
          path: "/idp/api/scorecards/scores/{entityId}",
          pathParams: { entity_id: "entityId" },
          responseExtractor: ngExtract,
          description: "Get score summary for an entity",
        },
      },
    },
    {
      resourceType: "idp_workflow",
      displayName: "IDP Workflow",
      description: "IDP self-service workflow. Supports list and execute action.",
      toolset: "idp",
      scope: "account",
      identifierFields: ["workflow_id"],
      operations: {
        list: {
          method: "GET",
          path: "/idp/api/workflows",
          responseExtractor: pageExtract,
          description: "List IDP workflows",
        },
      },
      executeActions: {
        execute: {
          method: "POST",
          path: "/idp/api/workflows/{workflowId}/execute",
          pathParams: { workflow_id: "workflowId" },
          bodyBuilder: (input) => input.body ?? {},
          responseExtractor: ngExtract,
          actionDescription: "Execute an IDP self-service workflow",
        },
      },
    },
    {
      resourceType: "idp_tech_doc",
      displayName: "IDP Tech Doc",
      description: "Search IDP TechDocs documentation. Supports list (search).",
      toolset: "idp",
      scope: "account",
      identifierFields: [],
      listFilterFields: ["query"],
      operations: {
        list: {
          method: "GET",
          path: "/idp/api/techdocs/search",
          queryParams: {
            query: "term",
          },
          responseExtractor: ngExtract,
          description: "Search IDP TechDocs",
        },
      },
    },
  ],
};
