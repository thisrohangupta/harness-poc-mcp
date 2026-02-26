import type { ToolsetDefinition } from "../types.js";

const pageExtract = (raw: unknown) => {
  const r = raw as { data?: { content?: unknown[]; totalElements?: number } };
  return { items: r.data?.content ?? [], total: r.data?.totalElements ?? 0 };
};

export const auditToolset: ToolsetDefinition = {
  name: "audit",
  displayName: "Audit Trail",
  description: "Platform audit events and activity log",
  resources: [
    {
      resourceType: "audit_event",
      displayName: "Audit Event",
      description: "Audit trail event. Supports list and get (YAML diff).",
      toolset: "audit",
      scope: "account",
      identifierFields: ["audit_id"],
      listFilterFields: ["search_term", "module", "action"],
      operations: {
        list: {
          method: "POST",
          path: "/audit/api/audits/list",
          queryParams: { page: "page", size: "size" },
          bodyBuilder: (input) => ({
            filterType: "Audit",
            modules: input.module ? [input.module] : undefined,
            actions: input.action ? [input.action] : undefined,
          }),
          responseExtractor: pageExtract,
          description: "List audit events",
        },
        get: {
          method: "GET",
          path: "/audit/api/audits/{auditId}/yaml-diff",
          pathParams: { audit_id: "auditId" },
          responseExtractor: (raw: unknown) => {
            const r = raw as { data?: unknown };
            return r.data ?? raw;
          },
          description: "Get audit event YAML diff",
        },
      },
    },
  ],
};
