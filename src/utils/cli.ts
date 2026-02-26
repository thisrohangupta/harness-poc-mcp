/**
 * CLI argument parsing for transport selection and port configuration.
 */

export type Transport = "stdio" | "http";

export interface CliArgs {
  transport: Transport;
  port: number;
}

const VALID_TRANSPORTS = new Set<string>(["stdio", "http"]);
const DEFAULT_PORT = 3000;
const MIN_PORT = 1;
const MAX_PORT = 65535;

/**
 * Parse CLI arguments for transport mode and port.
 *
 * Usage:
 *   node build/index.js [stdio|http] [--port <number>]
 *
 * - Transport defaults to "stdio" if not specified.
 * - Port defaults to --port flag, then PORT env var, then 3000.
 * - Throws on unknown transport names.
 */
export function parseArgs(argv: string[] = process.argv.slice(2)): CliArgs {
  const transport = parseTransport(argv);
  const port = parsePort(argv);
  return { transport, port };
}

function parseTransport(argv: string[]): Transport {
  // First positional arg that isn't a flag or flag value
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--port") {
      i++; // skip the value after --port
      continue;
    }
    if (arg.startsWith("-")) continue;

    if (!VALID_TRANSPORTS.has(arg)) {
      throw new Error(
        `Unknown transport: "${arg}". Supported: stdio, http`,
      );
    }
    return arg as Transport;
  }
  return "stdio";
}

function parsePort(argv: string[]): number {
  // Check --port flag first
  const portFlagIndex = argv.indexOf("--port");
  if (portFlagIndex !== -1 && portFlagIndex + 1 < argv.length) {
    const parsed = Number(argv[portFlagIndex + 1]);
    if (isValidPort(parsed)) return parsed;
  }

  // Fall back to PORT env var
  const envPort = process.env.PORT;
  if (envPort !== undefined) {
    const parsed = Number(envPort);
    if (isValidPort(parsed)) return parsed;
  }

  return DEFAULT_PORT;
}

function isValidPort(n: number): boolean {
  return Number.isInteger(n) && n >= MIN_PORT && n <= MAX_PORT;
}
