import type { ToolsetDefinition } from "../types.js";

const ngExtract = (raw: unknown) => {
  const r = raw as { data?: unknown };
  return r.data ?? raw;
};

const pageExtract = (raw: unknown) => {
  const r = raw as { data?: { content?: unknown[]; totalElements?: number } };
  return {
    items: r.data?.content ?? [],
    total: r.data?.totalElements ?? 0,
  };
};

export const templatesToolset: ToolsetDefinition = {
  name: "templates",
  displayName: "Templates",
  description: "Harness templates (pipeline, stage, step, etc.)",
  resources: [
    {
      resourceType: "template",
      displayName: "Template",
      description: "Reusable template definition. Supports list and get.",
      toolset: "templates",
      scope: "project",
      identifierFields: ["template_id"],
      listFilterFields: ["search_term", "template_type"],
      deepLinkTemplate: "/ng/account/{accountId}/home/orgs/{orgIdentifier}/projects/{projectIdentifier}/setup/resources/templates",
      operations: {
        list: {
          method: "POST",
          path: "/template/api/templates/list",
          queryParams: {
            search_term: "searchTerm",
            page: "page",
            size: "size",
            template_type: "templateListType",
          },
          bodyBuilder: (input) => ({
            filterType: "Template",
            templateEntityTypes: input.template_type
              ? [input.template_type]
              : undefined,
          }),
          responseExtractor: pageExtract,
          description: "List templates",
        },
        get: {
          method: "GET",
          path: "/template/api/templates/{templateIdentifier}",
          pathParams: { template_id: "templateIdentifier" },
          queryParams: { version_label: "versionLabel" },
          responseExtractor: ngExtract,
          description: "Get template details",
        },
      },
    },
  ],
};
