import type { ToolsetDefinition } from "../types.js";
import { ngExtract, pageExtract, passthrough } from "../extractors.js";

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
      deepLinkTemplate: "/ng/account/{accountId}/dashboards",
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
