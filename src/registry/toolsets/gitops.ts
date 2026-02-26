import type { ToolsetDefinition } from "../types.js";

/** GitOps API returns objects directly — pass through as-is */
const passthrough = (raw: unknown) => raw;

export const gitopsToolset: ToolsetDefinition = {
  name: "gitops",
  displayName: "GitOps",
  description:
    "Harness GitOps — agents, applications, clusters, and repositories",
  resources: [
    {
      resourceType: "gitops_agent",
      displayName: "GitOps Agent",
      description: "GitOps agent (Argo CD instance). Supports list and get.",
      toolset: "gitops",
      scope: "project",
      identifierFields: ["agent_id"],
      listFilterFields: ["search_term", "type"],
      operations: {
        list: {
          method: "GET",
          path: "/gitops/api/v1/agents",
          queryParams: {
            search_term: "searchTerm",
            type: "type",
            page: "page",
            size: "size",
          },
          responseExtractor: passthrough,
          description: "List GitOps agents",
        },
        get: {
          method: "GET",
          path: "/gitops/api/v1/agents/{agentIdentifier}",
          pathParams: { agent_id: "agentIdentifier" },
          responseExtractor: passthrough,
          description: "Get GitOps agent details",
        },
      },
    },
    {
      resourceType: "gitops_application",
      displayName: "GitOps Application",
      description:
        "GitOps application managed by an agent. Supports list, get, and sync action.",
      toolset: "gitops",
      scope: "project",
      identifierFields: ["agent_id", "app_name"],
      listFilterFields: ["search_term"],
      operations: {
        list: {
          method: "GET",
          path: "/gitops/api/v1/agents/{agentIdentifier}/applications",
          pathParams: { agent_id: "agentIdentifier" },
          queryParams: {
            search_term: "searchTerm",
            page: "page",
            size: "size",
          },
          responseExtractor: passthrough,
          description: "List GitOps applications for an agent",
        },
        get: {
          method: "GET",
          path: "/gitops/api/v1/agents/{agentIdentifier}/applications/{appName}",
          pathParams: {
            agent_id: "agentIdentifier",
            app_name: "appName",
          },
          responseExtractor: passthrough,
          description: "Get GitOps application details",
        },
      },
      executeActions: {
        sync: {
          method: "POST",
          path: "/gitops/api/v1/agents/{agentIdentifier}/applications/{appName}/sync",
          pathParams: {
            agent_id: "agentIdentifier",
            app_name: "appName",
          },
          bodyBuilder: (input) => input.body ?? {},
          responseExtractor: passthrough,
          actionDescription: "Sync a GitOps application",
        },
      },
    },
    {
      resourceType: "gitops_cluster",
      displayName: "GitOps Cluster",
      description: "Kubernetes cluster registered with a GitOps agent. Supports list.",
      toolset: "gitops",
      scope: "project",
      identifierFields: ["agent_id", "cluster_id"],
      operations: {
        list: {
          method: "GET",
          path: "/gitops/api/v1/agents/{agentIdentifier}/clusters",
          pathParams: { agent_id: "agentIdentifier" },
          responseExtractor: passthrough,
          description: "List clusters for a GitOps agent",
        },
      },
    },
    {
      resourceType: "gitops_repository",
      displayName: "GitOps Repository",
      description:
        "Git repository registered with a GitOps agent. Supports list.",
      toolset: "gitops",
      scope: "project",
      identifierFields: ["agent_id", "repo_id"],
      operations: {
        list: {
          method: "GET",
          path: "/gitops/api/v1/agents/{agentIdentifier}/repositories",
          pathParams: { agent_id: "agentIdentifier" },
          responseExtractor: passthrough,
          description: "List repositories for a GitOps agent",
        },
      },
    },
  ],
};
