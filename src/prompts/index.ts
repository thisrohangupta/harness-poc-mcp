import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerDebugPipelinePrompt } from "./debug-pipeline.js";
import { registerCreatePipelinePrompt } from "./create-pipeline.js";

export function registerAllPrompts(server: McpServer): void {
  registerDebugPipelinePrompt(server);
  registerCreatePipelinePrompt(server);
}
