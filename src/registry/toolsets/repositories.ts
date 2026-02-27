import type { ToolsetDefinition } from "../types.js";
import { passthrough } from "../extractors.js";

export const repositoriesToolset: ToolsetDefinition = {
  name: "repositories",
  displayName: "Code Repositories",
  description: "Harness Code repositories (source control)",
  resources: [
    {
      resourceType: "repository",
      displayName: "Repository",
      description: "Harness Code repository. Supports list and get.",
      toolset: "repositories",
      scope: "project",
      identifierFields: ["repo_id"],
      listFilterFields: ["query", "sort"],
      deepLinkTemplate: "/ng/account/{accountId}/module/code/orgs/{orgIdentifier}/projects/{projectIdentifier}/repos/{repoIdentifier}",
      operations: {
        list: {
          method: "GET",
          path: "/code/api/v1/repos",
          queryParams: {
            query: "query",
            sort: "sort",
            page: "page",
            limit: "limit",
          },
          responseExtractor: passthrough,
          description: "List code repositories",
        },
        get: {
          method: "GET",
          path: "/code/api/v1/repos/{repoIdentifier}",
          pathParams: { repo_id: "repoIdentifier" },
          responseExtractor: passthrough,
          description: "Get repository details",
        },
      },
    },
  ],
};
