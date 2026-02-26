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
  description: "Harness IDP — service catalog entities and scorecards",
  resources: [
    {
      resourceType: "idp_entity",
      displayName: "IDP Entity",
      description: "Internal Developer Portal catalog entity. Supports list.",
      toolset: "idp",
      scope: "account",
      identifierFields: ["entity_id"],
      listFilterFields: ["kind", "search"],
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
      },
    },
    {
      resourceType: "scorecard",
      displayName: "Scorecard",
      description: "IDP scorecard for tracking developer standards. Supports list and get.",
      toolset: "idp",
      scope: "account",
      identifierFields: ["scorecard_id"],
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
  ],
};
