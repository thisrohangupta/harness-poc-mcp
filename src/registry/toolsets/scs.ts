import type { ToolsetDefinition } from "../types.js";

/** SSCA API returns objects directly — pass through as-is */
const passthrough = (raw: unknown) => raw;

export const scsToolset: ToolsetDefinition = {
  name: "scs",
  displayName: "Software Supply Chain Assurance",
  description:
    "Harness SCS — artifact security and code repository security posture",
  resources: [
    {
      resourceType: "artifact_security",
      displayName: "Artifact Security",
      description: "Artifact security posture. Supports list.",
      toolset: "scs",
      scope: "project",
      identifierFields: ["artifact_id"],
      listFilterFields: ["search"],
      operations: {
        list: {
          method: "GET",
          path: "/ssca/api/v2/artifacts",
          queryParams: {
            search: "search",
            page: "page",
            size: "size",
          },
          responseExtractor: passthrough,
          description: "List artifact security entries",
        },
      },
    },
    {
      resourceType: "code_repo_security",
      displayName: "Code Repository Security",
      description: "Code repository security posture. Supports list.",
      toolset: "scs",
      scope: "project",
      identifierFields: ["repo_id"],
      listFilterFields: ["search"],
      operations: {
        list: {
          method: "GET",
          path: "/ssca/api/v2/repositories",
          queryParams: {
            search: "search",
            page: "page",
            size: "size",
          },
          responseExtractor: passthrough,
          description: "List code repository security entries",
        },
      },
    },
  ],
};
