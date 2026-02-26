import type { ToolsetDefinition } from "../types.js";

export const logsToolset: ToolsetDefinition = {
  name: "logs",
  displayName: "Execution Logs",
  description: "Pipeline execution log retrieval",
  resources: [
    {
      resourceType: "execution_log",
      displayName: "Execution Log",
      description: "Pipeline execution step logs. Get logs by execution ID and optional step/stage IDs.",
      toolset: "logs",
      scope: "project",
      identifierFields: ["execution_id"],
      listFilterFields: ["step_id", "stage_id", "unit_id"],
      operations: {
        get: {
          method: "POST",
          path: "/gateway/log-service/blob/download",
          queryParams: {
            execution_id: "key",
          },
          responseExtractor: (raw) => raw,
          description: "Download execution logs for a given execution/step",
        },
      },
    },
  ],
};
