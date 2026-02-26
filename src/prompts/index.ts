import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerDebugPipelinePrompt } from "./debug-pipeline.js";
import { registerCreatePipelinePrompt } from "./create-pipeline.js";
import { registerOptimizeCostsPrompt } from "./optimize-costs.js";
import { registerSecurityReviewPrompt } from "./security-review.js";
import { registerOnboardServicePrompt } from "./onboard-service.js";

export function registerAllPrompts(server: McpServer): void {
  registerDebugPipelinePrompt(server);
  registerCreatePipelinePrompt(server);
  registerOptimizeCostsPrompt(server);
  registerSecurityReviewPrompt(server);
  registerOnboardServicePrompt(server);
}
