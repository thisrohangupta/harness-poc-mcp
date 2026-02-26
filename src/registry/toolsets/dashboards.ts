import type { ToolsetDefinition } from "../types.js";

const ngExtract = (raw: unknown) => {
  const r = raw as { data?: unknown };
  return r.data ?? raw;
};

const passthrough = (raw: unknown) => raw;

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
    {
      resourceType: "dashboard_data",
      displayName: "Dashboard Data",
      description: "Download dashboard data as CSV. Supports get with optional reporting_timeframe (days, default 30).",
      toolset: "dashboards",
      scope: "account",
      identifierFields: ["dashboard_id"],
      listFilterFields: ["reporting_timeframe"],
      operations: {
        get: {
          method: "GET",
          path: "/dashboard/download/dashboards/{dashboardId}/csv",
          pathParams: { dashboard_id: "dashboardId" },
          queryParams: {
            reporting_timeframe: "filters",
            expanded_tables: "expanded_tables",
          },
          responseExtractor: passthrough,
          description: "Download dashboard data as CSV. Pass reporting_timeframe in days (default 30).",
        },
      },
    },
  ],
};
