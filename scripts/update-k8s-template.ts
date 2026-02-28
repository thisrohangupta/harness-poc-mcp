/**
 * One-off script: get K8s_Rolling_Deploy template, set pruningEnabled: true and
 * version 1.1, then create the new template version.
 * Run: pnpm build && node --env-file=.env build/scripts/update-k8s-template.js
 */
import { loadConfig } from "../config.js";
import { HarnessClient } from "../client/harness-client.js";
import { Registry } from "../registry/index.js";

const TEMPLATE_ID = "K8s_Rolling_Deploy";
const TEMPLATE_NAME = "K8s Rolling Deploy";
const NEW_VERSION = "1.1";

function extractYaml(result: unknown): string {
  const r = result as Record<string, unknown>;
  if (typeof r?.yaml === "string") return r.yaml;
  if (typeof r?.templateYaml === "string") return r.templateYaml;
  const data = r?.data as Record<string, unknown> | undefined;
  if (data && typeof data.yaml === "string") return data.yaml;
  if (data && typeof data.templateYaml === "string") return data.templateYaml;
  throw new Error("Template get response had no yaml/templateYaml string. Keys: " + Object.keys(r ?? {}).join(", "));
}

function applyChanges(yaml: string): string {
  let out = yaml;
  out = out.replace(/\bpruningEnabled:\s*false\b/, "pruningEnabled: true");
  out = out.replace(/\bpruningEnabled:\s*'false'\b/, "pruningEnabled: true");
  out = out.replace(/\bpruningEnabled:\s*"false"\b/, "pruningEnabled: true");
  // Set version label to 1.1 (common patterns)
  out = out.replace(/\bversionLabel:\s*["']?v1["']?/, 'versionLabel: "1.1"');
  out = out.replace(/\bversionLabel:\s*["']?1\.0["']?/, 'versionLabel: "1.1"');
  out = out.replace(/\bversion_label:\s*["']?v1["']?/, 'version_label: "1.1"');
  out = out.replace(/\bversion_label:\s*["']?1\.0["']?/, 'version_label: "1.1"');
  return out;
}

async function main() {
  const config = loadConfig();
  const client = new HarnessClient(config);
  const registry = new Registry(config);

  // Try 1.0 then v1 for current version
  let getResult: unknown;
  try {
    getResult = await registry.dispatch(client, "template", "get", {
      template_id: TEMPLATE_ID,
      version_label: "1.0",
    });
  } catch {
    getResult = await registry.dispatch(client, "template", "get", {
      template_id: TEMPLATE_ID,
      version_label: "v1",
    });
  }

  const currentYaml = extractYaml(getResult);
  const modifiedYaml = applyChanges(currentYaml);

  const createResult = await registry.dispatch(client, "template", "create", {
    body: {
      template_yaml: modifiedYaml,
      identifier: TEMPLATE_ID,
      name: TEMPLATE_NAME,
      label: NEW_VERSION,
      is_stable: true,
    },
  });

  console.error("Created template version", NEW_VERSION, "with pruningEnabled: true");
  const out = createResult as Record<string, unknown>;
  if (out?.openInHarness) console.error("Open:", String(out.openInHarness));
  console.log(JSON.stringify(createResult, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
