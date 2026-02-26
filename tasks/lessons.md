# Lessons Learned

## MCP SDK v1.27+ Type Compatibility
- **Issue**: `server.tool()` callback return type requires `[key: string]: unknown` index signature on the result object.
- **Fix**: Add `[key: string]: unknown` to the ToolResult interface.
- **Rule**: Always check MCP SDK type expectations for return types before defining custom interfaces.

## MCP SDK Prompt API
- **Issue**: `server.prompt()` does NOT accept an array of `{ name, description, required }` for args. It uses a Zod schema object.
- **Fix**: Use `{ paramName: z.string().describe("...").optional() }` format for prompt argument schemas.
- **Rule**: Check the actual SDK `.d.ts` types, not just documentation examples that may be outdated.
