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

export const dashboardsToolset: ToolsetDefinition = {
  name: "dashboards",
  displayName: "Dashboards",
  description: "Harness custom dashboards and analytics",
  resources: [
    {
      resourceType: "dashboard",
      displayName: "Dashboard",
      description: "Custom analytics dashboard. Supports list and get.",
      toolset: "dashboards",
      scope: "account",
      identifierFields: ["dashboard_id"],
      listFilterFields: ["search_term"],
      deepLinkTemplate: "/ng/account/{accountId}/dashboards",
      operations: {
        list: {
          method: "GET",
          path: "/dashboard/api/dashboards",
          queryParams: {
            search_term: "searchTerm",
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List dashboards",
        },
        get: {
          method: "GET",
          path: "/dashboard/api/dashboards/{dashboardId}",
          pathParams: { dashboard_id: "dashboardId" },
          responseExtractor: ngExtract,
          description: "Get dashboard details",
        },
      },
    },
  ],
};
