import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Typed error for Harness API failures.
 */
export class HarnessApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly harnessCode?: string,
    public readonly correlationId?: string,
  ) {
    super(message);
    this.name = "HarnessApiError";
  }
}

/**
 * Map a HarnessApiError (or generic Error) to an MCP-friendly McpError.
 */
export function toMcpError(err: unknown): McpError {
  if (err instanceof McpError) return err;

  if (err instanceof HarnessApiError) {
    const code = mapHttpStatusToMcpCode(err.statusCode);
    const detail = err.correlationId ? ` (correlationId: ${err.correlationId})` : "";
    return new McpError(code, `${err.message}${detail}`);
  }

  if (err instanceof Error) {
    return new McpError(ErrorCode.InternalError, err.message);
  }

  return new McpError(ErrorCode.InternalError, String(err));
}

function mapHttpStatusToMcpCode(status: number): ErrorCode {
  if (status === 400) return ErrorCode.InvalidParams;
  if (status === 401 || status === 403) return ErrorCode.InvalidRequest;
  if (status === 404) return ErrorCode.InvalidParams;
  if (status === 429) return ErrorCode.InternalError;
  return ErrorCode.InternalError;
}
