import type { ToolsetDefinition } from "../types.js";

/** Default response extractor for standard NG API responses */
const ngExtract = (raw: unknown) => {
  const r = raw as { data?: unknown; status?: string };
  return r.data ?? raw;
};

/** Extract paginated content */
const pageExtract = (raw: unknown) => {
  const r = raw as { data?: { content?: unknown[]; totalElements?: number } };
  return {
    items: r.data?.content ?? [],
    total: r.data?.totalElements ?? 0,
  };
};

export const pipelinesToolset: ToolsetDefinition = {
  name: "pipelines",
  displayName: "Pipelines",
  description: "CI/CD pipelines, executions, triggers, and input sets",
  resources: [
    {
      resourceType: "pipeline",
      displayName: "Pipeline",
      description: "CI/CD pipeline definition. Supports list, get, create, update, delete, and execute (run).",
      toolset: "pipelines",
      scope: "project",
      identifierFields: ["pipeline_id"],
      listFilterFields: ["search_term", "module", "filter_type"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/pipelines/{pipelineIdentifier}/pipeline-studio",
      operations: {
        list: {
          method: "POST",
          path: "/pipeline/api/pipelines/list",
          queryParams: {
            search_term: "searchTerm",
            module: "module",
            page: "page",
            size: "size",
          },
          bodyBuilder: (input) => ({
            filterType: input.filter_type ?? "PipelineSetup",
          }),
          responseExtractor: pageExtract,
          description: "List all pipelines in a project",
        },
        get: {
          method: "GET",
          path: "/pipeline/api/pipelines/{pipelineIdentifier}",
          pathParams: { pipeline_id: "pipelineIdentifier" },
          responseExtractor: ngExtract,
          description: "Get pipeline details including YAML definition",
        },
        create: {
          method: "POST",
          path: "/pipeline/api/pipelines/v2",
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Create a new pipeline from YAML",
        },
        update: {
          method: "PUT",
          path: "/pipeline/api/pipelines/v2/{pipelineIdentifier}",
          pathParams: { pipeline_id: "pipelineIdentifier" },
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Update an existing pipeline YAML",
        },
        delete: {
          method: "DELETE",
          path: "/pipeline/api/pipelines/{pipelineIdentifier}",
          pathParams: { pipeline_id: "pipelineIdentifier" },
          responseExtractor: ngExtract,
          description: "Delete a pipeline",
        },
      },
      executeActions: {
        run: {
          method: "POST",
          path: "/pipeline/api/pipeline/execute/{pipelineIdentifier}",
          pathParams: { pipeline_id: "pipelineIdentifier" },
          queryParams: { module: "module" },
          bodyBuilder: (input) => input.inputs ?? {},
          responseExtractor: ngExtract,
          actionDescription: "Execute/run a pipeline. Pass runtime inputs via 'inputs' field.",
        },
        retry: {
          method: "PUT",
          path: "/pipeline/api/pipeline/execute/retry/{planExecutionId}",
          pathParams: { execution_id: "planExecutionId" },
          queryParams: { module: "module" },
          bodyBuilder: () => ({}),
          responseExtractor: ngExtract,
          actionDescription: "Retry a failed pipeline execution.",
        },
      },
    },
    {
      resourceType: "execution",
      displayName: "Pipeline Execution",
      description: "Pipeline execution history and details. Supports list and get.",
      toolset: "pipelines",
      scope: "project",
      identifierFields: ["execution_id"],
      listFilterFields: ["pipeline_id", "status", "module"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/pipelines/{pipelineIdentifier}/executions/{planExecutionId}/pipeline",
      operations: {
        list: {
          method: "POST",
          path: "/pipeline/api/pipelines/execution/summary",
          queryParams: {
            page: "page",
            size: "size",
            module: "module",
          },
          bodyBuilder: (input) => ({
            filterType: "PipelineExecution",
            pipelineIdentifier: input.pipeline_id,
            status: input.status ? [input.status] : undefined,
          }),
          responseExtractor: pageExtract,
          description: "List pipeline execution history",
        },
        get: {
          method: "GET",
          path: "/pipeline/api/pipelines/execution/v2/{planExecutionId}",
          pathParams: { execution_id: "planExecutionId" },
          responseExtractor: ngExtract,
          description: "Get execution details including stage/step status",
        },
      },
      executeActions: {
        interrupt: {
          method: "PUT",
          path: "/pipeline/api/pipeline/execute/interrupt/{planExecutionId}",
          pathParams: { execution_id: "planExecutionId" },
          queryParams: { interrupt_type: "interruptType" },
          bodyBuilder: () => ({}),
          responseExtractor: ngExtract,
          actionDescription: "Interrupt a running execution. Set interrupt_type to AbortAll, Pause, etc.",
        },
      },
    },
    {
      resourceType: "trigger",
      displayName: "Pipeline Trigger",
      description: "Automated pipeline triggers (webhook, cron, etc.)",
      toolset: "pipelines",
      scope: "project",
      identifierFields: ["pipeline_id", "trigger_id"],
      listFilterFields: ["pipeline_id", "search_term"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/pipelines/{pipeline_id}/triggers",
      operations: {
        list: {
          method: "GET",
          path: "/pipeline/api/triggers",
          queryParams: {
            pipeline_id: "targetIdentifier",
            search_term: "searchTerm",
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List triggers for a pipeline",
        },
        get: {
          method: "GET",
          path: "/pipeline/api/triggers/{triggerIdentifier}",
          pathParams: { trigger_id: "triggerIdentifier" },
          queryParams: { pipeline_id: "targetIdentifier" },
          responseExtractor: ngExtract,
          description: "Get trigger details",
        },
        create: {
          method: "POST",
          path: "/pipeline/api/triggers",
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Create a new pipeline trigger",
        },
        update: {
          method: "PUT",
          path: "/pipeline/api/triggers/{triggerIdentifier}",
          pathParams: { trigger_id: "triggerIdentifier" },
          bodyBuilder: (input) => input.body,
          responseExtractor: ngExtract,
          description: "Update a pipeline trigger",
        },
        delete: {
          method: "DELETE",
          path: "/pipeline/api/triggers/{triggerIdentifier}",
          pathParams: { trigger_id: "triggerIdentifier" },
          responseExtractor: ngExtract,
          description: "Delete a pipeline trigger",
        },
      },
    },
    {
      resourceType: "pipeline_summary",
      displayName: "Pipeline Summary",
      description: "Lightweight pipeline summary — less data than full get_pipeline. Supports get only.",
      toolset: "pipelines",
      scope: "project",
      identifierFields: ["pipeline_id"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/pipelines/{pipelineIdentifier}/pipeline-studio",
      operations: {
        get: {
          method: "GET",
          path: "/pipeline/api/pipelines/summary/{pipelineIdentifier}",
          pathParams: { pipeline_id: "pipelineIdentifier" },
          responseExtractor: ngExtract,
          description: "Get a lightweight pipeline summary (without full YAML)",
        },
      },
    },
    {
      resourceType: "input_set",
      displayName: "Input Set",
      description: "Reusable runtime input sets for pipelines",
      toolset: "pipelines",
      scope: "project",
      identifierFields: ["pipeline_id", "input_set_id"],
      listFilterFields: ["pipeline_id"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/pipelines/{pipeline_id}/input-sets",
      operations: {
        list: {
          method: "GET",
          path: "/pipeline/api/inputSets",
          queryParams: {
            pipeline_id: "pipelineIdentifier",
            page: "page",
            size: "size",
          },
          responseExtractor: pageExtract,
          description: "List input sets for a pipeline",
        },
        get: {
          method: "GET",
          path: "/pipeline/api/inputSets/{inputSetIdentifier}",
          pathParams: { input_set_id: "inputSetIdentifier" },
          queryParams: { pipeline_id: "pipelineIdentifier" },
          responseExtractor: ngExtract,
          description: "Get input set details",
        },
      },
    },
  ],
};
