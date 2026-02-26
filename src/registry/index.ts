import type { Config } from "../config.js";
import type { HarnessClient } from "../client/harness-client.js";
import type { ResourceDefinition, ToolsetDefinition, ToolsetName, OperationName, EndpointSpec } from "./types.js";
import { createLogger } from "../utils/logger.js";
import { buildDeepLink } from "../utils/deep-links.js";

// Import all toolsets
import { pipelinesToolset } from "./toolsets/pipelines.js";
import { servicesToolset } from "./toolsets/services.js";
import { environmentsToolset } from "./toolsets/environments.js";
import { connectorsToolset } from "./toolsets/connectors.js";
import { infrastructureToolset } from "./toolsets/infrastructure.js";
import { secretsToolset } from "./toolsets/secrets.js";
import { logsToolset } from "./toolsets/logs.js";
import { auditToolset } from "./toolsets/audit.js";
import { delegatesToolset } from "./toolsets/delegates.js";
import { repositoriesToolset } from "./toolsets/repositories.js";
import { registriesToolset } from "./toolsets/registries.js";
import { templatesToolset } from "./toolsets/templates.js";
import { dashboardsToolset } from "./toolsets/dashboards.js";
import { idpToolset } from "./toolsets/idp.js";
import { pullRequestsToolset } from "./toolsets/pull-requests.js";
import { featureFlagsToolset } from "./toolsets/feature-flags.js";
import { gitopsToolset } from "./toolsets/gitops.js";
import { chaosToolset } from "./toolsets/chaos.js";
import { ccmToolset } from "./toolsets/ccm.js";
import { seiToolset } from "./toolsets/sei.js";
import { scsToolset } from "./toolsets/scs.js";
import { stoToolset } from "./toolsets/sto.js";

const log = createLogger("registry");

/** All available toolsets */
const ALL_TOOLSETS: ToolsetDefinition[] = [
  pipelinesToolset,
  servicesToolset,
  environmentsToolset,
  connectorsToolset,
  infrastructureToolset,
  secretsToolset,
  logsToolset,
  auditToolset,
  delegatesToolset,
  repositoriesToolset,
  registriesToolset,
  templatesToolset,
  dashboardsToolset,
  idpToolset,
  pullRequestsToolset,
  featureFlagsToolset,
  gitopsToolset,
  chaosToolset,
  ccmToolset,
  seiToolset,
  scsToolset,
  stoToolset,
];

/**
 * The enabled registry — filtered by HARNESS_TOOLSETS config.
 */
export class Registry {
  private resourceMap: Map<string, ResourceDefinition> = new Map();
  private toolsets: ToolsetDefinition[] = [];

  constructor(private config: Config) {
    const enabledNames = this.parseToolsetFilter();
    this.toolsets = enabledNames
      ? ALL_TOOLSETS.filter((t) => enabledNames.has(t.name))
      : ALL_TOOLSETS;

    for (const toolset of this.toolsets) {
      for (const resource of toolset.resources) {
        this.resourceMap.set(resource.resourceType, resource);
      }
    }

    log.info(`Registry loaded: ${this.resourceMap.size} resource types from ${this.toolsets.length} toolsets`);
  }

  private parseToolsetFilter(): Set<ToolsetName> | null {
    const raw = this.config.HARNESS_TOOLSETS;
    if (!raw || raw.trim() === "") return null;
    return new Set(raw.split(",").map((s) => s.trim()) as ToolsetName[]);
  }

  /** Get a resource definition by type, or throw. */
  getResource(resourceType: string): ResourceDefinition {
    const def = this.resourceMap.get(resourceType);
    if (!def) {
      const available = Array.from(this.resourceMap.keys()).sort().join(", ");
      throw new Error(`Unknown resource_type "${resourceType}". Available: ${available}`);
    }
    return def;
  }

  /** Get all enabled resource types. */
  getAllResourceTypes(): string[] {
    return Array.from(this.resourceMap.keys()).sort();
  }

  /** Get all enabled toolsets with their resources. */
  getAllToolsets(): ToolsetDefinition[] {
    return this.toolsets;
  }

  /** Check if a resource type supports an operation. */
  supportsOperation(resourceType: string, operation: OperationName): boolean {
    const def = this.resourceMap.get(resourceType);
    return def?.operations[operation] !== undefined;
  }

  /** Check if a resource type has execute actions. */
  getExecuteActions(resourceType: string): Record<string, EndpointSpec & { actionDescription: string }> | undefined {
    const def = this.resourceMap.get(resourceType);
    return def?.executeActions;
  }

  /** Dispatch a CRUD operation to the Harness API. */
  async dispatch(
    client: HarnessClient,
    resourceType: string,
    operation: OperationName,
    input: Record<string, unknown>,
  ): Promise<unknown> {
    const def = this.getResource(resourceType);
    const spec = def.operations[operation];
    if (!spec) {
      const supported = Object.keys(def.operations).join(", ");
      throw new Error(`Resource "${resourceType}" does not support "${operation}". Supported: ${supported}`);
    }

    return this.executeSpec(client, def, spec, input);
  }

  /** Dispatch an execute action to the Harness API. */
  async dispatchExecute(
    client: HarnessClient,
    resourceType: string,
    action: string,
    input: Record<string, unknown>,
  ): Promise<unknown> {
    const def = this.getResource(resourceType);
    const actionSpec = def.executeActions?.[action];
    if (!actionSpec) {
      const available = def.executeActions ? Object.keys(def.executeActions).join(", ") : "none";
      throw new Error(`Resource "${resourceType}" has no execute action "${action}". Available: ${available}`);
    }

    return this.executeSpec(client, def, actionSpec, input);
  }

  private async executeSpec(
    client: HarnessClient,
    def: ResourceDefinition,
    spec: EndpointSpec,
    input: Record<string, unknown>,
  ): Promise<unknown> {
    // Build path with substitutions
    let path = spec.path;
    if (spec.pathParams) {
      for (const [inputKey, pathPlaceholder] of Object.entries(spec.pathParams)) {
        const value = input[inputKey];
        if (value === undefined || value === "") {
          throw new Error(`Missing required field "${inputKey}" for path parameter "${pathPlaceholder}"`);
        }
        path = path.replace(`{${pathPlaceholder}}`, encodeURIComponent(String(value)));
      }
    }

    // Build query params
    const params: Record<string, string | number | boolean | undefined> = {};

    // Add scope params
    if (def.scope === "project" || def.scope === "org") {
      params.orgIdentifier = (input.org_id as string) ?? this.config.HARNESS_DEFAULT_ORG_ID;
    }
    if (def.scope === "project") {
      params.projectIdentifier = (input.project_id as string) ?? this.config.HARNESS_DEFAULT_PROJECT_ID;
    }

    // Map input fields to query params
    if (spec.queryParams) {
      for (const [inputKey, queryKey] of Object.entries(spec.queryParams)) {
        const value = input[inputKey];
        if (value !== undefined && value !== "") {
          params[queryKey] = value as string | number | boolean;
        }
      }
    }

    // Build body
    const body = spec.bodyBuilder ? spec.bodyBuilder(input) : undefined;

    // Make request
    const raw = await client.request({
      method: spec.method,
      path,
      params,
      body,
    });

    // Extract response
    const result = spec.responseExtractor ? spec.responseExtractor(raw) : raw;

    // Attach deep link if available
    if (def.deepLinkTemplate && typeof result === "object" && result !== null) {
      const linkParams: Record<string, string> = {
        orgIdentifier: (params.orgIdentifier as string) ?? "",
        projectIdentifier: (params.projectIdentifier as string) ?? "",
      };
      // Add identifier fields
      for (const field of def.identifierFields) {
        const value = input[field];
        if (value) {
          // Map input field name to the path param name used in deep link template
          const pathParamName = spec.pathParams?.[field] ?? field;
          linkParams[pathParamName] = String(value);
        }
      }
      try {
        (result as Record<string, unknown>)._deepLink = buildDeepLink(
          this.config.HARNESS_BASE_URL,
          this.config.HARNESS_ACCOUNT_ID,
          def.deepLinkTemplate,
          linkParams,
        );
      } catch {
        // Deep link construction failed — non-critical
      }
    }

    return result;
  }

  /** Get describe metadata for all enabled resource types. */
  describe(): Record<string, unknown> {
    const toolsets: Record<string, unknown> = {};
    for (const ts of this.toolsets) {
      toolsets[ts.name] = {
        displayName: ts.displayName,
        description: ts.description,
        resources: ts.resources.map((r) => ({
          resource_type: r.resourceType,
          displayName: r.displayName,
          description: r.description,
          scope: r.scope,
          operations: Object.keys(r.operations),
          executeActions: r.executeActions ? Object.keys(r.executeActions) : undefined,
          identifierFields: r.identifierFields,
          listFilterFields: r.listFilterFields,
        })),
      };
    }
    return {
      total_resource_types: this.resourceMap.size,
      total_toolsets: this.toolsets.length,
      toolsets,
    };
  }
}
