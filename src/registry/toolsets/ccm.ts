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

export const ccmToolset: ToolsetDefinition = {
  name: "ccm",
  displayName: "Cloud Cost Management",
  description:
    "Harness CCM — perspectives, recommendations, anomalies, and cost categories",
  resources: [
    {
      resourceType: "cost_perspective",
      displayName: "Cost Perspective",
      description: "Cloud cost perspective/view. Supports list and get.",
      toolset: "ccm",
      scope: "account",
      identifierFields: ["perspective_id"],
      operations: {
        list: {
          method: "GET",
          path: "/ccm/api/perspectives",
          queryParams: {
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List cost perspectives",
        },
        get: {
          method: "GET",
          path: "/ccm/api/perspective/{perspectiveId}",
          pathParams: { perspective_id: "perspectiveId" },
          responseExtractor: ngExtract,
          description: "Get cost perspective details",
        },
      },
    },
    {
      resourceType: "cost_recommendation",
      displayName: "Cost Recommendation",
      description: "Cloud cost optimization recommendation. Supports list.",
      toolset: "ccm",
      scope: "account",
      identifierFields: [],
      operations: {
        list: {
          method: "POST",
          path: "/ccm/api/recommendation/overview/list",
          bodyBuilder: () => ({}),
          responseExtractor: ngExtract,
          description: "List cost recommendations",
        },
      },
    },
    {
      resourceType: "cost_anomaly",
      displayName: "Cost Anomaly",
      description: "Detected cloud cost anomaly. Supports list.",
      toolset: "ccm",
      scope: "account",
      identifierFields: ["anomaly_id"],
      operations: {
        list: {
          method: "POST",
          path: "/ccm/api/anomaly/list",
          bodyBuilder: () => ({}),
          responseExtractor: ngExtract,
          description: "List cost anomalies",
        },
      },
    },
    {
      resourceType: "cost_category",
      displayName: "Cost Category",
      description: "Cost category (business mapping). Supports list.",
      toolset: "ccm",
      scope: "account",
      identifierFields: ["category_id"],
      operations: {
        list: {
          method: "GET",
          path: "/ccm/api/business-mapping",
          queryParams: {
            page: "page",
            size: "size",
          },
          responseExtractor: ngExtract,
          description: "List cost categories",
        },
      },
    },
  ],
};
