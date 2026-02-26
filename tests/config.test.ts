import { describe, it, expect } from "vitest";
import { ConfigSchema } from "../src/config.js";

describe("ConfigSchema", () => {
  const validConfig = {
    HARNESS_API_KEY: "pat.xxx.xxx.xxx",
    HARNESS_ACCOUNT_ID: "acct123",
  };

  it("parses valid full config", () => {
    const result = ConfigSchema.safeParse({
      ...validConfig,
      HARNESS_BASE_URL: "https://custom.harness.io",
      HARNESS_DEFAULT_ORG_ID: "myorg",
      HARNESS_DEFAULT_PROJECT_ID: "myproject",
      HARNESS_API_TIMEOUT_MS: "5000",
      HARNESS_MAX_RETRIES: "5",
      LOG_LEVEL: "debug",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.HARNESS_BASE_URL).toBe("https://custom.harness.io");
      expect(result.data.HARNESS_DEFAULT_ORG_ID).toBe("myorg");
      expect(result.data.HARNESS_DEFAULT_PROJECT_ID).toBe("myproject");
      expect(result.data.HARNESS_API_TIMEOUT_MS).toBe(5000);
      expect(result.data.HARNESS_MAX_RETRIES).toBe(5);
      expect(result.data.LOG_LEVEL).toBe("debug");
    }
  });

  it("fails when HARNESS_API_KEY is missing", () => {
    const result = ConfigSchema.safeParse({ HARNESS_ACCOUNT_ID: "acct123" });
    expect(result.success).toBe(false);
  });

  it("fails when HARNESS_ACCOUNT_ID is missing", () => {
    const result = ConfigSchema.safeParse({ HARNESS_API_KEY: "pat.xxx" });
    expect(result.success).toBe(false);
  });

  it("fails when HARNESS_API_KEY is empty", () => {
    const result = ConfigSchema.safeParse({ HARNESS_API_KEY: "", HARNESS_ACCOUNT_ID: "acct" });
    expect(result.success).toBe(false);
  });

  it("applies default HARNESS_BASE_URL", () => {
    const result = ConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.HARNESS_BASE_URL).toBe("https://app.harness.io");
    }
  });

  it("applies default HARNESS_DEFAULT_ORG_ID", () => {
    const result = ConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.HARNESS_DEFAULT_ORG_ID).toBe("default");
    }
  });

  it("applies default LOG_LEVEL", () => {
    const result = ConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.LOG_LEVEL).toBe("info");
    }
  });

  it("applies default timeout and retries", () => {
    const result = ConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.HARNESS_API_TIMEOUT_MS).toBe(30000);
      expect(result.data.HARNESS_MAX_RETRIES).toBe(3);
    }
  });

  it("coerces string numbers for timeout and retries", () => {
    const result = ConfigSchema.safeParse({
      ...validConfig,
      HARNESS_API_TIMEOUT_MS: "10000",
      HARNESS_MAX_RETRIES: "2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.HARNESS_API_TIMEOUT_MS).toBe(10000);
      expect(result.data.HARNESS_MAX_RETRIES).toBe(2);
    }
  });

  it("HARNESS_DEFAULT_PROJECT_ID is optional", () => {
    const result = ConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.HARNESS_DEFAULT_PROJECT_ID).toBeUndefined();
    }
  });

  it("HARNESS_TOOLSETS is optional", () => {
    const result = ConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.HARNESS_TOOLSETS).toBeUndefined();
    }
  });
});
