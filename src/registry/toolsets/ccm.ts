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

const gqlExtract = (field: string) => (raw: unknown) => {
  const r = raw as { data?: Record<string, unknown> };
  return r.data?.[field] ?? raw;
};

// ---------------------------------------------------------------------------
// GraphQL queries — ported from the official Go MCP server
// (client/ccmcommons/ccmgraphqlqueries.go)
// ---------------------------------------------------------------------------

const PERSPECTIVE_GRID_QUERY = `
query FetchperspectiveGrid(
  $filters: [QLCEViewFilterWrapperInput],
  $groupBy: [QLCEViewGroupByInput],
  $limit: Int,
  $offset: Int,
  $aggregateFunction: [QLCEViewAggregationInput],
  $isClusterOnly: Boolean!,
  $isClusterHourlyData: Boolean = null,
  $preferences: ViewPreferencesInput
) {
  perspectiveGrid(
    aggregateFunction: $aggregateFunction
    filters: $filters
    groupBy: $groupBy
    limit: $limit
    offset: $offset
    preferences: $preferences
    isClusterHourlyData: $isClusterHourlyData
    sortCriteria: [{sortType: COST, sortOrder: DESCENDING}]
  ) {
    data { name id cost costTrend __typename }
    __typename
  }
  perspectiveTotalCount(
    filters: $filters
    groupBy: $groupBy
    isClusterQuery: $isClusterOnly
    isClusterHourlyData: $isClusterHourlyData
  )
}`;

const PERSPECTIVE_TIMESERIES_QUERY = `
query FetchPerspectiveTimeSeries(
  $filters: [QLCEViewFilterWrapperInput],
  $groupBy: [QLCEViewGroupByInput],
  $limit: Int,
  $preferences: ViewPreferencesInput,
  $isClusterHourlyData: Boolean = null
) {
  perspectiveTimeSeriesStats(
    filters: $filters
    groupBy: $groupBy
    limit: $limit
    preferences: $preferences
    isClusterHourlyData: $isClusterHourlyData
    aggregateFunction: [{operationType: SUM, columnName: "cost"}]
    sortCriteria: [{sortType: COST, sortOrder: DESCENDING}]
  ) {
    stats {
      values {
        key { id name type __typename }
        value
        __typename
      }
      time
      __typename
    }
    __typename
  }
}`;

const PERSPECTIVE_SUMMARY_QUERY = `
query FetchPerspectiveDetailsSummaryWithBudget(
  $filters: [QLCEViewFilterWrapperInput],
  $aggregateFunction: [QLCEViewAggregationInput],
  $isClusterQuery: Boolean,
  $isClusterHourlyData: Boolean = null,
  $groupBy: [QLCEViewGroupByInput],
  $preferences: ViewPreferencesInput
) {
  perspectiveTrendStats(
    filters: $filters
    aggregateFunction: $aggregateFunction
    isClusterQuery: $isClusterQuery
    isClusterHourlyData: $isClusterHourlyData
    groupBy: $groupBy
    preferences: $preferences
  ) {
    cost { statsDescription statsLabel statsTrend statsValue value __typename }
    idleCost { statsLabel statsValue value __typename }
    unallocatedCost { statsLabel statsValue value __typename }
    utilizedCost { statsLabel statsValue value __typename }
    efficiencyScoreStats { statsLabel statsTrend statsValue __typename }
    __typename
  }
  perspectiveForecastCost(
    filters: $filters
    aggregateFunction: $aggregateFunction
    isClusterQuery: $isClusterQuery
    isClusterHourlyData: $isClusterHourlyData
    groupBy: $groupBy
    preferences: $preferences
  ) {
    cost { statsLabel statsTrend statsValue statsDescription value __typename }
    __typename
  }
}`;

const PERSPECTIVE_BUDGET_QUERY = `
query FetchPerspectiveBudget($perspectiveId: String) {
  budgetSummaryList(perspectiveId: $perspectiveId) {
    id name budgetAmount actualCost timeLeft timeUnit timeScope period folderId __typename
  }
}`;

const CCM_METADATA_QUERY = `
query FetchCcmMetaData {
  ccmMetaData {
    k8sClusterConnectorPresent cloudDataPresent awsConnectorsPresent
    gcpConnectorsPresent azureConnectorsPresent applicationDataPresent
    inventoryDataPresent clusterDataPresent externalDataPresent
    isSampleClusterPresent defaultAzurePerspectiveId defaultAwsPerspectiveId
    defaultGcpPerspectiveId defaultClusterPerspectiveId
    defaultExternalDataPerspectiveId showCostOverview
    currencyPreference { destinationCurrency symbol locale setupTime __typename }
    __typename
  }
}`;

const PERSPECTIVE_RECOMMENDATIONS_QUERY = `
query PerspectiveRecommendations($filter: RecommendationFilterDTOInput) {
  recommendationStatsV2(filter: $filter) {
    totalMonthlyCost totalMonthlySaving count __typename
  }
  recommendationsV2(filter: $filter) {
    items {
      clusterName namespace id resourceType resourceName
      monthlyCost monthlySaving __typename
    }
    __typename
  }
}`;

// ---------------------------------------------------------------------------
// GraphQL helper builders — TypeScript equivalents of the Go filter helpers
// ---------------------------------------------------------------------------

const VALID_TIME_FILTERS = [
  "LAST_7", "THIS_MONTH", "LAST_30_DAYS", "THIS_QUARTER", "THIS_YEAR",
  "LAST_MONTH", "LAST_QUARTER", "LAST_YEAR", "LAST_3_MONTHS",
  "LAST_6_MONTHS", "LAST_12_MONTHS",
] as const;

const VALID_GROUP_BY_FIELDS = [
  "region", "awsUsageaccountid", "awsServicecode", "awsBillingEntity",
  "awsInstancetype", "awsLineItemType", "awspayeraccountid", "awsUsageType",
  "cloudProvider", "none", "product",
] as const;

const OUTPUT_FIELDS: Record<string, Record<string, string>> = {
  region:              { fieldId: "region",              fieldName: "Region",         identifier: "COMMON", identifierName: "Common" },
  awsUsageaccountid:   { fieldId: "awsUsageaccountid",   fieldName: "Account",        identifier: "AWS",    identifierName: "AWS" },
  awsServicecode:      { fieldId: "awsServicecode",      fieldName: "Service",        identifier: "AWS",    identifierName: "AWS" },
  awsBillingEntity:    { fieldId: "awsBillingEntity",     fieldName: "Billing Entity", identifier: "AWS",    identifierName: "AWS" },
  awsInstancetype:     { fieldId: "awsInstancetype",      fieldName: "Instance Type",  identifier: "AWS",    identifierName: "AWS" },
  awsLineItemType:     { fieldId: "awsLineItemType",      fieldName: "Line Item Type", identifier: "AWS",    identifierName: "AWS" },
  awspayeraccountid:   { fieldId: "awspayeraccountid",    fieldName: "Payer Account",  identifier: "AWS",    identifierName: "AWS" },
  awsUsageType:        { fieldId: "awsUsageType",         fieldName: "Usage Type",     identifier: "AWS",    identifierName: "AWS" },
  cloudProvider:       { fieldId: "cloudProvider",        fieldName: "Cloud Provider", identifier: "COMMON", identifierName: "Common" },
  none:                { fieldId: "none",                 fieldName: "None",           identifier: "COMMON", identifierName: "Common" },
  product:             { fieldId: "product",              fieldName: "Product",        identifier: "COMMON", identifierName: "Common" },
};

function buildTimeFilters(timeFilter: string): Record<string, unknown>[] {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (timeFilter) {
    case "LAST_7": {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6));
      end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      break;
    }
    case "THIS_MONTH": {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      break;
    }
    case "LAST_30_DAYS": {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30));
      end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      break;
    }
    case "LAST_MONTH": {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
      break;
    }
    case "LAST_12_MONTHS": {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12, 1));
      end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
      break;
    }
    default: {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30));
      end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      break;
    }
  }

  return [
    { timeFilter: { field: { fieldId: "startTime", fieldName: "startTime", identifier: "COMMON" }, operator: "AFTER", value: start.getTime() } },
    { timeFilter: { field: { fieldId: "startTime", fieldName: "startTime", identifier: "COMMON" }, operator: "BEFORE", value: end.getTime() } },
  ];
}

function buildViewFilter(viewId: string): Record<string, unknown>[] {
  return [{ viewMetadataFilter: { viewId, isPreview: false } }];
}

function buildFilters(viewId: string, timeFilter: string): Record<string, unknown>[] {
  return [...buildViewFilter(viewId), ...buildTimeFilters(timeFilter)];
}

function buildGroupBy(field?: string): Record<string, unknown>[] {
  const groupByField = field && OUTPUT_FIELDS[field]
    ? OUTPUT_FIELDS[field]
    : OUTPUT_FIELDS["product"];
  return [{ entityGroupBy: groupByField }];
}

function buildAggregateFunction(): Record<string, string>[] {
  return [{ operationType: "SUM", columnName: "cost" }];
}

function buildPreferences(): Record<string, unknown> {
  return {
    includeOthers: false,
    includeUnallocatedCost: false,
    awsPreferences: {
      includeDiscounts: false,
      includeCredits: false,
      includeRefunds: false,
      includeTaxes: false,
      awsCost: "UNBLENDED",
    },
    gcpPreferences: null,
    azureViewPreferences: null,
    showAnomalies: false,
  };
}

// ---------------------------------------------------------------------------
// GraphQL endpoint path helper
// ---------------------------------------------------------------------------

function gqlPath(input: Record<string, unknown>): string {
  const accountId = input.account_id as string | undefined;
  if (accountId) {
    return `/ccm/api/graphql?accountIdentifier=${accountId}&routingId=${accountId}`;
  }
  return "/ccm/api/graphql";
}

// ---------------------------------------------------------------------------
// Toolset definition: 6 resource types covering REST + GraphQL
// ---------------------------------------------------------------------------

export const ccmToolset: ToolsetDefinition = {
  name: "ccm",
  displayName: "Cloud Cost Management",
  description:
    "Cloud cost visibility, analysis, recommendations, and anomaly detection. Covers perspectives, cost breakdowns, time series, summaries, recommendations, and anomalies.",
  resources: [
    // ------------------------------------------------------------------
    // 1. cost_perspective — REST CRUD for perspective management
    // ------------------------------------------------------------------
    {
      resourceType: "cost_perspective",
      displayName: "Cost Perspective",
      description:
        "A cloud cost perspective (saved view). Use harness_list to see all perspectives, harness_get for details. This is the starting point — get a perspective_id first, then use cost_breakdown or cost_timeseries to drill into costs.",
      toolset: "ccm",
      scope: "account",
      identifierFields: ["perspective_id"],
      operations: {
        list: {
          method: "GET",
          path: "/ccm/api/perspectives",
          queryParams: { page: "page", size: "size" },
          responseExtractor: pageExtract,
          description: "List all cost perspectives for the account",
        },
        get: {
          method: "GET",
          path: "/ccm/api/perspective/{perspectiveId}",
          pathParams: { perspective_id: "perspectiveId" },
          responseExtractor: ngExtract,
          description: "Get cost perspective details by ID",
        },
        create: {
          method: "POST",
          path: "/ccm/api/perspective",
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Create a new cost perspective",
        },
        update: {
          method: "PUT",
          path: "/ccm/api/perspective",
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Update an existing cost perspective",
        },
        delete: {
          method: "DELETE",
          path: "/ccm/api/perspective/{perspectiveId}",
          pathParams: { perspective_id: "perspectiveId" },
          responseExtractor: ngExtract,
          description: "Delete a cost perspective",
        },
      },
    },

    // ------------------------------------------------------------------
    // 2. cost_breakdown — GraphQL perspective grid (drill-down by dimension)
    //    Replaces: ccm_perspective_grid from the official server
    //    Answers: "Where is my money going?"
    // ------------------------------------------------------------------
    {
      resourceType: "cost_breakdown",
      displayName: "Cost Breakdown",
      description: `Drill-down cost breakdown by any dimension within a perspective. Answers "where is my money going?" Returns cost per entity (e.g. per AWS service, per region, per product).

Required: perspective_id (get from cost_perspective list).
Optional: group_by (${VALID_GROUP_BY_FIELDS.join(", ")}), time_filter (${VALID_TIME_FILTERS.join(", ")}), limit, offset.`,
      toolset: "ccm",
      scope: "account",
      identifierFields: ["perspective_id"],
      listFilterFields: ["group_by", "time_filter", "limit", "offset"],
      operations: {
        list: {
          method: "POST",
          path: "/ccm/api/graphql",
          bodyBuilder: (input) => ({
            query: PERSPECTIVE_GRID_QUERY,
            operationName: "FetchperspectiveGrid",
            variables: {
              filters: buildFilters(
                input.perspective_id as string,
                (input.time_filter as string) ?? "LAST_30_DAYS",
              ),
              groupBy: buildGroupBy(input.group_by as string | undefined),
              limit: (input.limit as number) ?? 25,
              offset: (input.offset as number) ?? 0,
              aggregateFunction: buildAggregateFunction(),
              isClusterOnly: false,
              isClusterHourlyData: false,
              preferences: buildPreferences(),
            },
          }),
          responseExtractor: (raw) => {
            const r = raw as {
              data?: {
                perspectiveGrid?: { data?: unknown[] };
                perspectiveTotalCount?: number;
              };
            };
            return {
              items: r.data?.perspectiveGrid?.data ?? [],
              total: r.data?.perspectiveTotalCount ?? 0,
            };
          },
          description:
            "Get cost breakdown by dimension for a perspective. Group by region, awsServicecode, product, cloudProvider, etc.",
        },
      },
    },

    // ------------------------------------------------------------------
    // 3. cost_timeseries — GraphQL perspective time series
    //    Replaces: ccm_perspective_time_series from the official server
    //    Answers: "How has my spend changed over time?"
    // ------------------------------------------------------------------
    {
      resourceType: "cost_timeseries",
      displayName: "Cost Time Series",
      description: `Cost over time for a perspective, grouped by a dimension. Answers "how has my spend changed?" Returns daily/monthly cost data points.

Required: perspective_id, group_by (${VALID_GROUP_BY_FIELDS.join(", ")}).
Optional: time_filter (${VALID_TIME_FILTERS.join(", ")}), time_resolution (DAY, MONTH, WEEK), limit.`,
      toolset: "ccm",
      scope: "account",
      identifierFields: ["perspective_id"],
      listFilterFields: ["group_by", "time_filter", "time_resolution", "limit"],
      operations: {
        list: {
          method: "POST",
          path: "/ccm/api/graphql",
          bodyBuilder: (input) => {
            const timeResolution = (input.time_resolution as string) ?? "DAY";
            const entityGroupBy = buildGroupBy(input.group_by as string | undefined);
            const timeTruncGroupBy = { timeTruncGroupBy: { resolution: timeResolution } };

            return {
              query: PERSPECTIVE_TIMESERIES_QUERY,
              operationName: "FetchPerspectiveTimeSeries",
              variables: {
                filters: buildFilters(
                  input.perspective_id as string,
                  (input.time_filter as string) ?? "LAST_30_DAYS",
                ),
                groupBy: [timeTruncGroupBy, entityGroupBy[0]],
                limit: (input.limit as number) ?? 12,
                preferences: buildPreferences(),
                isClusterHourlyData: false,
              },
            };
          },
          responseExtractor: (raw) => {
            const r = raw as {
              data?: { perspectiveTimeSeriesStats?: { stats?: unknown[] } };
            };
            return r.data?.perspectiveTimeSeriesStats?.stats ?? [];
          },
          description:
            "Get cost time series data for a perspective. Shows cost trends over time grouped by a dimension.",
        },
      },
    },

    // ------------------------------------------------------------------
    // 4. cost_summary — GraphQL perspective trend + forecast + budget
    //    Replaces: ccm_perspective_summary_with_budget, ccm_perspective_budget,
    //              get_ccm_overview, get_ccm_metadata from the official server
    //    Answers: "What's my cost overview for this perspective?"
    // ------------------------------------------------------------------
    {
      resourceType: "cost_summary",
      displayName: "Cost Summary",
      description: `High-level cost summary for a perspective: total cost, trend, idle cost, unallocated cost, efficiency score, forecast, and budget status. Answers "what's my cost overview?"

Required: perspective_id.
Optional: time_filter (${VALID_TIME_FILTERS.join(", ")}).

Use with no perspective_id to get CCM metadata (available connectors, default perspective IDs).`,
      toolset: "ccm",
      scope: "account",
      identifierFields: ["perspective_id"],
      listFilterFields: ["time_filter"],
      operations: {
        list: {
          method: "POST",
          path: "/ccm/api/graphql",
          bodyBuilder: (input) => {
            const perspectiveId = input.perspective_id as string | undefined;

            if (!perspectiveId) {
              return {
                query: CCM_METADATA_QUERY,
                operationName: "FetchCcmMetaData",
                variables: {},
              };
            }

            return {
              query: PERSPECTIVE_SUMMARY_QUERY,
              operationName: "FetchPerspectiveDetailsSummaryWithBudget",
              variables: {
                filters: buildFilters(
                  perspectiveId,
                  (input.time_filter as string) ?? "LAST_30_DAYS",
                ),
                groupBy: buildGroupBy(),
                aggregateFunction: buildAggregateFunction(),
                isClusterQuery: false,
                isClusterHourlyData: false,
                preferences: buildPreferences(),
              },
            };
          },
          responseExtractor: (raw) => {
            const r = raw as { data?: Record<string, unknown> };
            if (!r.data) return raw;
            if (r.data.ccmMetaData) return r.data.ccmMetaData;
            return {
              trendStats: r.data.perspectiveTrendStats,
              forecastCost: r.data.perspectiveForecastCost,
            };
          },
          description:
            "Get cost summary with trend, forecast, idle/unallocated costs. Omit perspective_id to get CCM metadata.",
        },
        get: {
          method: "POST",
          path: "/ccm/api/graphql",
          bodyBuilder: (input) => ({
            query: PERSPECTIVE_BUDGET_QUERY,
            operationName: "FetchPerspectiveBudget",
            variables: { perspectiveId: input.perspective_id as string },
          }),
          responseExtractor: gqlExtract("budgetSummaryList"),
          description:
            "Get budget status for a perspective (budget amount, actual cost, time remaining).",
        },
      },
    },

    // ------------------------------------------------------------------
    // 5. cost_recommendation — REST for general recs, GraphQL for
    //    perspective-scoped recs. Two operations: list (REST) and get
    //    (GraphQL by perspective).
    //    Replaces: 5 resource-type-specific tools + list tools from the
    //              official server, all parameterized by resource_type
    //    Answers: "How do I reduce my cloud bill?"
    // ------------------------------------------------------------------
    {
      resourceType: "cost_recommendation",
      displayName: "Cost Recommendation",
      description: `Cloud cost optimization recommendations. Answers "how do I reduce my cloud bill?"

harness_list: General recommendations across the account.
harness_get: Perspective-scoped recommendations — pass perspective_id to get recs for a specific perspective with savings stats. Optionally pass min_saving, time_filter (${VALID_TIME_FILTERS.join(", ")}), limit, offset.

Replaces the 5 separate resource-type tools from the official server (EC2, Azure VM, ECS, Node Pool, Workload) — all resource types are returned in a single list.`,
      toolset: "ccm",
      scope: "account",
      identifierFields: ["perspective_id"],
      listFilterFields: ["min_saving", "time_filter", "limit", "offset"],
      operations: {
        list: {
          method: "POST",
          path: "/ccm/api/recommendation/overview/list",
          bodyBuilder: () => ({}),
          responseExtractor: ngExtract,
          description:
            "List all cost optimization recommendations across the account. Returns recommendations for all resource types (EC2, Azure VM, ECS, Node Pool, Workload) in a single response.",
        },
        get: {
          method: "POST",
          path: "/ccm/api/graphql",
          bodyBuilder: (input) => ({
            query: PERSPECTIVE_RECOMMENDATIONS_QUERY,
            operationName: "PerspectiveRecommendations",
            variables: {
              filter: {
                perspectiveFilters: buildFilters(
                  input.perspective_id as string,
                  (input.time_filter as string) ?? "LAST_30_DAYS",
                ),
                limit: (input.limit as number) ?? 25,
                offset: (input.offset as number) ?? 0,
                minSaving: (input.min_saving as number) ?? 0,
              },
            },
          }),
          responseExtractor: (raw) => {
            const r = raw as {
              data?: {
                recommendationsV2?: { items?: unknown[] };
                recommendationStatsV2?: unknown;
              };
            };
            return {
              items: r.data?.recommendationsV2?.items ?? [],
              stats: r.data?.recommendationStatsV2,
            };
          },
          description:
            "Get recommendations scoped to a specific perspective, with aggregate savings stats. Filter by min_saving, time_filter.",
        },
      },
    },

    // ------------------------------------------------------------------
    // 6. cost_anomaly — REST only (rich filtering)
    //    Replaces: list_ccm_anomalies, list_all_ccm_anomalies,
    //              list_ccm_ignored_anomalies, get_ccm_anomalies_for_perspective
    //    All consolidated into one parameterized resource type
    //    Answers: "Are there any unexpected cost spikes?"
    // ------------------------------------------------------------------
    {
      resourceType: "cost_anomaly",
      displayName: "Cost Anomaly",
      description: `Detected cloud cost anomalies — unexpected cost spikes. Answers "are there any unusual charges?"

Filter by: perspective_id, status (ACTIVE, IGNORED, ARCHIVED, RESOLVED), min_amount, min_anomalous_spend, limit, offset.
All the separate anomaly tools from the official server (list, list_all, list_ignored, by_perspective) are unified here via filter parameters.`,
      toolset: "ccm",
      scope: "account",
      identifierFields: ["anomaly_id"],
      listFilterFields: ["perspective_id", "status", "min_amount", "min_anomalous_spend", "limit", "offset"],
      operations: {
        list: {
          method: "POST",
          path: "/ccm/api/anomaly",
          queryParams: {
            perspective_id: "perspectiveId",
          },
          bodyBuilder: (input) => {
            const filters: Record<string, unknown> = {
              filterType: "Anomaly",
              limit: (input.limit as number) ?? 25,
              offset: (input.offset as number) ?? 0,
            };

            if (input.status) {
              filters.status = Array.isArray(input.status) ? input.status : [input.status];
            }
            if (input.min_amount) {
              filters.minActualAmount = input.min_amount;
            }
            if (input.min_anomalous_spend) {
              filters.minAnomalousSpend = input.min_anomalous_spend;
            }

            return { anomalyFilterPropertiesDTO: filters };
          },
          responseExtractor: ngExtract,
          description:
            "List cost anomalies. Filter by status (ACTIVE/IGNORED/ARCHIVED/RESOLVED), perspective_id, min_amount, min_anomalous_spend.",
        },
      },
    },

    // ------------------------------------------------------------------
    // 7. cost_category — REST for business mappings / cost categories
    // ------------------------------------------------------------------
    {
      resourceType: "cost_category",
      displayName: "Cost Category",
      description:
        "Cost categories (business mappings) for organizing cloud costs into business units.",
      toolset: "ccm",
      scope: "account",
      identifierFields: ["category_id"],
      operations: {
        list: {
          method: "GET",
          path: "/ccm/api/business-mapping",
          queryParams: { page: "page", size: "size" },
          responseExtractor: ngExtract,
          description: "List all cost categories (business mappings)",
        },
      },
    },
  ],
};
