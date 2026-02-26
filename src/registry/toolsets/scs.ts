import type { ToolsetDefinition } from "../types.js";

/** SSCA API returns objects directly — pass through as-is */
const passthrough = (raw: unknown) => raw;

export const scsToolset: ToolsetDefinition = {
  name: "scs",
  displayName: "Software Supply Chain Assurance",
  description:
    "Harness SCS — artifact security, code repository security, SBOMs, compliance, and OPA policies",
  resources: [
    {
      resourceType: "artifact_security",
      displayName: "Artifact Security",
      description: "Artifact security posture. Supports list and get (overview, chain of custody, components).",
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
        get: {
          method: "GET",
          path: "/ssca/api/v2/artifacts/{artifactId}",
          pathParams: { artifact_id: "artifactId" },
          responseExtractor: passthrough,
          description: "Get artifact security overview",
        },
      },
    },
    {
      resourceType: "code_repo_security",
      displayName: "Code Repository Security",
      description: "Code repository security posture. Supports list and get (overview, compliance).",
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
        get: {
          method: "GET",
          path: "/ssca/api/v2/repositories/{repoId}",
          pathParams: { repo_id: "repoId" },
          responseExtractor: passthrough,
          description: "Get code repository security overview",
        },
      },
    },
    {
      resourceType: "scs_sbom",
      displayName: "SBOM",
      description: "Software Bill of Materials for an artifact. Supports get (download).",
      toolset: "scs",
      scope: "project",
      identifierFields: ["artifact_id"],
      operations: {
        get: {
          method: "GET",
          path: "/ssca/api/v2/artifacts/{artifactId}/sbom/download",
          pathParams: { artifact_id: "artifactId" },
          responseExtractor: passthrough,
          description: "Download SBOM for an artifact",
        },
      },
    },
    {
      resourceType: "scs_artifact_component",
      displayName: "SCS Artifact Component",
      description: "Components (dependencies) within an artifact. Supports list.",
      toolset: "scs",
      scope: "project",
      identifierFields: ["artifact_id"],
      listFilterFields: ["search"],
      operations: {
        list: {
          method: "GET",
          path: "/ssca/api/v2/artifacts/{artifactId}/components",
          pathParams: { artifact_id: "artifactId" },
          queryParams: {
            search: "search",
            page: "page",
            size: "size",
          },
          responseExtractor: passthrough,
          description: "List components in an artifact",
        },
      },
    },
    {
      resourceType: "scs_compliance_result",
      displayName: "SCS Compliance Result",
      description: "Compliance scan results for a code repository. Supports list.",
      toolset: "scs",
      scope: "project",
      identifierFields: ["repo_id"],
      operations: {
        list: {
          method: "GET",
          path: "/ssca/api/v2/repositories/{repoId}/compliance",
          pathParams: { repo_id: "repoId" },
          queryParams: {
            page: "page",
            size: "size",
          },
          responseExtractor: passthrough,
          description: "Fetch compliance results for a code repository",
        },
      },
    },
    {
      resourceType: "scs_opa_policy",
      displayName: "SCS OPA Policy",
      description: "OPA policy for supply chain governance. Supports create.",
      toolset: "scs",
      scope: "project",
      identifierFields: ["policy_id"],
      operations: {
        create: {
          method: "POST",
          path: "/ssca/api/v2/policies",
          bodyBuilder: (input) => input.body,
          responseExtractor: passthrough,
          description: "Create an OPA policy for supply chain governance",
        },
      },
    },
  ],
};
