import type { ToolsetDefinition } from "../types.js";

/** Code API returns arrays/objects directly — pass through as-is */
const passthrough = (raw: unknown) => raw;

export const pullRequestsToolset: ToolsetDefinition = {
  name: "pull-requests",
  displayName: "Pull Requests",
  description: "Harness Code pull requests",
  resources: [
    {
      resourceType: "pull_request",
      displayName: "Pull Request",
      description: "Code pull request. Supports list and get.",
      toolset: "pull-requests",
      scope: "project",
      identifierFields: ["repo_id", "pr_number"],
      listFilterFields: ["state", "query"],
      operations: {
        list: {
          method: "GET",
          path: "/code/api/v1/repos/{repoIdentifier}/pullreq",
          pathParams: { repo_id: "repoIdentifier" },
          queryParams: {
            state: "state",
            query: "query",
            page: "page",
            limit: "limit",
          },
          responseExtractor: passthrough,
          description: "List pull requests for a repository",
        },
        get: {
          method: "GET",
          path: "/code/api/v1/repos/{repoIdentifier}/pullreq/{prNumber}",
          pathParams: {
            repo_id: "repoIdentifier",
            pr_number: "prNumber",
          },
          responseExtractor: passthrough,
          description: "Get pull request details",
        },
      },
    },
  ],
};
