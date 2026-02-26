import type { ToolsetDefinition } from "../types.js";

const ngExtract = (raw: unknown) => {
  const r = raw as { data?: unknown };
  return r.data ?? raw;
};

export const delegatesToolset: ToolsetDefinition = {
  name: "delegates",
  displayName: "Delegates",
  description: "Delegate management, health status, and delegate tokens",
  resources: [
    {
      resourceType: "delegate",
      displayName: "Delegate",
      description: "Harness delegate agent for executing tasks. List-only.",
      toolset: "delegates",
      scope: "account",
      identifierFields: ["delegate_id"],
      operations: {
        list: {
          method: "POST",
          path: "/ng/api/delegate-setup/listDelegates",
          bodyBuilder: () => ({}),
          responseExtractor: (raw: unknown) => {
            const r = raw as { resource?: unknown };
            return r.resource ?? raw;
          },
          description: "List all delegates in the account",
        },
      },
    },
    {
      resourceType: "delegate_token",
      displayName: "Delegate Token",
      description: "Delegate registration token. Supports list.",
      toolset: "delegates",
      scope: "project",
      identifierFields: ["token_name"],
      listFilterFields: ["name", "status"],
      operations: {
        list: {
          method: "GET",
          path: "/ng/api/delegate-token-ng",
          queryParams: {
            name: "name",
            status: "status",
          },
          responseExtractor: ngExtract,
          description: "List delegate tokens",
        },
      },
    },
  ],
};
