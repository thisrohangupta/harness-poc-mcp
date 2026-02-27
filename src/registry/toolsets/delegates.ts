import type { ToolsetDefinition } from "../types.js";
import { ngExtract } from "../extractors.js";

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
      deepLinkTemplate: "/ng/account/{accountId}/settings/resources/delegates",
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
      description: "Delegate registration token. Supports list, get, create, delete, and revoke action.",
      toolset: "delegates",
      scope: "project",
      identifierFields: ["token_name"],
      listFilterFields: ["name", "status"],
      deepLinkTemplate: "/ng/account/{accountId}/settings/resources/delegates/tokens",
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
        get: {
          method: "GET",
          path: "/ng/api/delegate-token-ng/{tokenName}",
          pathParams: { token_name: "tokenName" },
          responseExtractor: ngExtract,
          description: "Get delegate token details",
        },
        create: {
          method: "POST",
          path: "/ng/api/delegate-token-ng",
          bodyBuilder: (input) => ({
            name: input.token_name ?? input.name,
          }),
          responseExtractor: ngExtract,
          description: "Create a delegate token",
        },
        delete: {
          method: "DELETE",
          path: "/ng/api/delegate-token-ng/{tokenName}",
          pathParams: { token_name: "tokenName" },
          responseExtractor: ngExtract,
          description: "Delete a delegate token",
        },
      },
      executeActions: {
        revoke: {
          method: "PUT",
          path: "/ng/api/delegate-token-ng/{tokenName}",
          pathParams: { token_name: "tokenName" },
          queryParams: { status: "status" },
          bodyBuilder: () => undefined,
          responseExtractor: ngExtract,
          actionDescription: "Revoke a delegate token. Sets status to REVOKED.",
        },
        get_delegates: {
          method: "GET",
          path: "/ng/api/delegate-token-ng/{tokenName}/delegates",
          pathParams: { token_name: "tokenName" },
          responseExtractor: ngExtract,
          actionDescription: "Get delegates associated with a specific token.",
        },
      },
    },
  ],
};
