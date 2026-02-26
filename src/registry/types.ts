/**
 * Core types for the resource registry and dispatch system.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ToolsetName =
  | "pipelines"
  | "services"
  | "environments"
  | "infrastructure"
  | "connectors"
  | "secrets"
  | "logs"
  | "audit"
  | "delegates"
  | "repositories"
  | "registries"
  | "templates"
  | "dashboards"
  | "idp"
  | "pull-requests"
  | "feature-flags"
  | "gitops"
  | "chaos"
  | "ccm"
  | "sei"
  | "scs"
  | "sto"
  | "access_control";

export type OperationName = "list" | "get" | "create" | "update" | "delete";

/**
 * Specifies how a single CRUD operation maps to the Harness API.
 */
export interface EndpointSpec {
  method: HttpMethod;
  /** Path template, e.g. "/pipeline/api/pipelines/{pipelineIdentifier}" */
  path: string;
  /** Maps tool input field names to path param placeholders */
  pathParams?: Record<string, string>;
  /** Maps tool input field names to query param names */
  queryParams?: Record<string, string>;
  /** For POST/PUT: how to build the request body from tool input */
  bodyBuilder?: (input: Record<string, unknown>) => unknown;
  /** For GET: extract the useful part from the raw response */
  responseExtractor?: (raw: unknown) => unknown;
  /** Description shown in harness_describe output */
  description?: string;
}

/**
 * Declarative definition of a Harness resource type and how it maps to CRUD endpoints.
 */
export interface ResourceDefinition {
  /** Unique key: "pipeline", "service", "connector", etc. */
  resourceType: string;
  /** Human-readable name: "Pipeline", "Service", etc. */
  displayName: string;
  /** Brief description for harness_describe output */
  description: string;
  /** Which toolset this resource belongs to (for HARNESS_TOOLSETS filtering) */
  toolset: ToolsetName;
  /** Scope level: "project" | "org" | "account" */
  scope: "project" | "org" | "account";
  /** Primary identifier field names: ["pipeline_id"], ["service_id"], etc. */
  identifierFields: string[];
  /** Additional filter fields for list operations */
  listFilterFields?: string[];
  /** Harness UI deep-link URL template */
  deepLinkTemplate?: string;
  /** CRUD endpoint mappings */
  operations: Partial<Record<OperationName, EndpointSpec>>;
  /** Execute action mappings (e.g. run pipeline, toggle FF) */
  executeActions?: Record<string, EndpointSpec & { actionDescription: string }>;
}

/**
 * A toolset groups related ResourceDefinitions together.
 */
export interface ToolsetDefinition {
  name: ToolsetName;
  displayName: string;
  description: string;
  resources: ResourceDefinition[];
}
