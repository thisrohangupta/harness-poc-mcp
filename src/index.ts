#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { setLogLevel, createLogger } from "./utils/logger.js";
import { HarnessClient } from "./client/harness-client.js";
import { Registry } from "./registry/index.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllResources } from "./resources/index.js";
import { registerAllPrompts } from "./prompts/index.js";

const log = createLogger("main");

async function main(): Promise<void> {
  // Load and validate config
  const config = loadConfig();
  setLogLevel(config.LOG_LEVEL);

  log.info("Starting harness-mcp-server", {
    baseUrl: config.HARNESS_BASE_URL,
    accountId: config.HARNESS_ACCOUNT_ID,
    defaultOrg: config.HARNESS_DEFAULT_ORG_ID,
    defaultProject: config.HARNESS_DEFAULT_PROJECT_ID ?? "(none)",
    toolsets: config.HARNESS_TOOLSETS ?? "(all)",
  });

  // Initialize client and registry
  const client = new HarnessClient(config);
  const registry = new Registry(config);

  // Create MCP server
  const server = new McpServer({
    name: "harness-mcp-server",
    version: "1.0.0",
  });

  // Register all tools, resources, and prompts
  registerAllTools(server, registry, client);
  registerAllResources(server, registry, client, config);
  registerAllPrompts(server);

  // Determine transport from CLI args
  const transportArg = process.argv[2] ?? "stdio";

  if (transportArg === "stdio") {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    log.info("harness-mcp-server connected via stdio");
  } else {
    log.error(`Unknown transport: ${transportArg}. Supported: stdio`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
