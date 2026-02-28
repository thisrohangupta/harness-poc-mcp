import type { ToolsetDefinition } from "../types.js";
import { passthrough } from "../extractors.js";

export const pullRequestsToolset: ToolsetDefinition = {
  name: "pull-requests",
  displayName: "Pull Requests",
  description: "Harness Code pull requests, checks, and activities",
  resources: [
    {
      resourceType: "pull_request",
      displayName: "Pull Request",
      description: "Code pull request. Supports list, get, and create.",
      toolset: "pull-requests",
      scope: "project",
      identifierFields: ["repo_id", "pr_number"],
      listFilterFields: ["state", "query"],
      deepLinkTemplate: "/ng/account/{accountId}/module/code/orgs/{orgIdentifier}/projects/{projectIdentifier}/repos/{repoIdentifier}/pull-requests/{prNumber}",
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
        create: {
          method: "POST",
          path: "/code/api/v1/repos/{repoIdentifier}/pullreq",
          pathParams: { repo_id: "repoIdentifier" },
          bodyBuilder: (input) => input.body,
          responseExtractor: passthrough,
          description: "Create a pull request",
        },
      },
    },
    {
      resourceType: "pr_check",
      displayName: "PR Check",
      description: "Status checks on a pull request. Supports list.",
      toolset: "pull-requests",
      scope: "project",
      identifierFields: ["repo_id", "pr_number"],
      operations: {
        list: {
          method: "GET",
          path: "/code/api/v1/repos/{repoIdentifier}/pullreq/{prNumber}/checks",
          pathParams: {
            repo_id: "repoIdentifier",
            pr_number: "prNumber",
          },
          responseExtractor: passthrough,
          description: "List status checks for a pull request",
        },
      },
    },
    {
      resourceType: "pr_activity",
      displayName: "PR Activity",
      description: "Activity timeline on a pull request (comments, reviews, status changes). Supports list.",
      toolset: "pull-requests",
      scope: "project",
      identifierFields: ["repo_id", "pr_number"],
      operations: {
        list: {
          method: "GET",
          path: "/code/api/v1/repos/{repoIdentifier}/pullreq/{prNumber}/activities",
          pathParams: {
            repo_id: "repoIdentifier",
            pr_number: "prNumber",
          },
          responseExtractor: passthrough,
          description: "List activities for a pull request",
        },
      },
    },
  ],
};
