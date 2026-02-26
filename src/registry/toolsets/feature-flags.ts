import type { ToolsetDefinition } from "../types.js";

/** CF API returns objects directly — pass through as-is */
const passthrough = (raw: unknown) => raw;

export const featureFlagsToolset: ToolsetDefinition = {
  name: "feature-flags",
  displayName: "Feature Flags",
  description: "Harness Feature Flags — create, toggle, and manage flags",
  resources: [
    {
      resourceType: "feature_flag",
      displayName: "Feature Flag",
      description:
        "Feature flag. Supports list, get, create, delete, and toggle action.",
      toolset: "feature-flags",
      scope: "project",
      identifierFields: ["flag_id"],
      listFilterFields: ["name", "environment"],
      operations: {
        list: {
          method: "GET",
          path: "/cf/admin/features",
          queryParams: {
            name: "name",
            environment: "environment",
            page: "pageNumber",
            size: "pageSize",
          },
          responseExtractor: passthrough,
          description: "List feature flags",
        },
        get: {
          method: "GET",
          path: "/cf/admin/features/{flagIdentifier}",
          pathParams: { flag_id: "flagIdentifier" },
          queryParams: { environment: "environment" },
          responseExtractor: passthrough,
          description: "Get feature flag details",
        },
        create: {
          method: "POST",
          path: "/cf/admin/features",
          bodyBuilder: (input) => input.body,
          responseExtractor: passthrough,
          description: "Create a new feature flag",
        },
        delete: {
          method: "DELETE",
          path: "/cf/admin/features/{flagIdentifier}",
          pathParams: { flag_id: "flagIdentifier" },
          responseExtractor: passthrough,
          description: "Delete a feature flag",
        },
      },
      executeActions: {
        toggle: {
          method: "PATCH",
          path: "/cf/admin/features/{flagIdentifier}",
          pathParams: { flag_id: "flagIdentifier" },
          queryParams: { environment: "environment" },
          bodyBuilder: (input) => ({
            instructions: [
              { kind: input.enable ? "turnFlagOn" : "turnFlagOff" },
            ],
          }),
          responseExtractor: passthrough,
          actionDescription:
            "Toggle a feature flag on/off. Set 'enable' to true/false and specify 'environment'.",
        },
      },
    },
  ],
};
