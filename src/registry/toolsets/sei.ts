import type { ToolsetDefinition } from "../types.js";

/** SEI API returns objects directly — pass through as-is */
const passthrough = (raw: unknown) => raw;

export const seiToolset: ToolsetDefinition = {
  name: "sei",
  displayName: "Software Engineering Insights",
  description: "Harness SEI — engineering metrics and productivity insights",
  resources: [
    {
      resourceType: "sei_metric",
      displayName: "SEI Metric",
      description: "Software engineering insight metric. Supports list.",
      toolset: "sei",
      scope: "account",
      identifierFields: [],
      operations: {
        list: {
          method: "GET",
          path: "/sei/api/v1/metrics",
          queryParams: {
            page: "page",
            size: "size",
          },
          responseExtractor: passthrough,
          description: "List SEI metrics",
        },
      },
    },
  ],
};
