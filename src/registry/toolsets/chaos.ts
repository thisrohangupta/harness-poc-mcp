import type { ToolsetDefinition } from "../types.js";

/** Chaos API returns objects directly — pass through as-is */
const passthrough = (raw: unknown) => raw;

export const chaosToolset: ToolsetDefinition = {
  name: "chaos",
  displayName: "Chaos Engineering",
  description: "Harness Chaos Engineering — experiments and probes",
  resources: [
    {
      resourceType: "chaos_experiment",
      displayName: "Chaos Experiment",
      description:
        "Chaos experiment definition. Supports list, get, and run action.",
      toolset: "chaos",
      scope: "project",
      identifierFields: ["experiment_id"],
      listFilterFields: ["search_term"],
      operations: {
        list: {
          method: "POST",
          path: "/chaos/manager/api/experiments",
          queryParams: {
            page: "page",
            limit: "limit",
          },
          bodyBuilder: (input) => ({
            filter: { experimentName: input.search_term },
          }),
          responseExtractor: passthrough,
          description: "List chaos experiments",
        },
        get: {
          method: "GET",
          path: "/chaos/manager/api/experiments/{experimentId}",
          pathParams: { experiment_id: "experimentId" },
          responseExtractor: passthrough,
          description: "Get chaos experiment details",
        },
      },
      executeActions: {
        run: {
          method: "POST",
          path: "/chaos/manager/api/experiments/{experimentId}/run",
          pathParams: { experiment_id: "experimentId" },
          bodyBuilder: () => ({}),
          responseExtractor: passthrough,
          actionDescription: "Run a chaos experiment",
        },
      },
    },
    {
      resourceType: "chaos_probe",
      displayName: "Chaos Probe",
      description: "Chaos resilience probe. Supports list.",
      toolset: "chaos",
      scope: "project",
      identifierFields: ["probe_id"],
      operations: {
        list: {
          method: "POST",
          path: "/chaos/manager/api/probes",
          bodyBuilder: () => ({}),
          responseExtractor: passthrough,
          description: "List chaos probes",
        },
      },
    },
  ],
};
