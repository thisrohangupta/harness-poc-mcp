import type { ToolsetDefinition } from "../types.js";

/** STO API returns objects directly — pass through as-is */
const passthrough = (raw: unknown) => raw;

export const stoToolset: ToolsetDefinition = {
  name: "sto",
  displayName: "Security Testing Orchestration",
  description:
    "Harness STO — security issues, vulnerabilities, and exemptions",
  resources: [
    {
      resourceType: "security_issue",
      displayName: "Security Issue",
      description:
        "Security vulnerability/issue from scan results. Supports list and get.",
      toolset: "sto",
      scope: "project",
      identifierFields: ["issue_id"],
      listFilterFields: ["search", "severity"],
      operations: {
        list: {
          method: "GET",
          path: "/sto/api/v2/issues",
          queryParams: {
            search: "search",
            severity: "severity",
            page: "page",
            size: "size",
          },
          responseExtractor: passthrough,
          description: "List security issues",
        },
        get: {
          method: "GET",
          path: "/sto/api/v2/issues/{issueId}",
          pathParams: { issue_id: "issueId" },
          responseExtractor: passthrough,
          description: "Get security issue details",
        },
      },
    },
    {
      resourceType: "security_exemption",
      displayName: "Security Exemption",
      description: "Security issue exemption/waiver. Supports list with approve/reject actions.",
      toolset: "sto",
      scope: "project",
      identifierFields: ["exemption_id"],
      operations: {
        list: {
          method: "GET",
          path: "/sto/api/v2/exemptions",
          queryParams: {
            page: "page",
            size: "size",
          },
          responseExtractor: passthrough,
          description: "List security exemptions",
        },
      },
      executeActions: {
        approve: {
          method: "POST",
          path: "/sto/api/v2/exemptions/{exemptionId}/approve",
          pathParams: { exemption_id: "exemptionId" },
          bodyBuilder: () => ({}),
          responseExtractor: passthrough,
          actionDescription: "Approve (promote and approve) a security exemption",
        },
        reject: {
          method: "POST",
          path: "/sto/api/v2/exemptions/{exemptionId}/reject",
          pathParams: { exemption_id: "exemptionId" },
          bodyBuilder: () => ({}),
          responseExtractor: passthrough,
          actionDescription: "Reject a security exemption",
        },
      },
    },
  ],
};
