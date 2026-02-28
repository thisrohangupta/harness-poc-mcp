import type { ToolsetDefinition, BodySchema } from "../types.js";
import { passthrough } from "../extractors.js";

const askBodySchema: BodySchema = {
  description: "DevOps Agent prompt request",
  fields: [
    {
      name: "prompt",
      type: "string",
      required: true,
      description: "The question or instruction to send to the DevOps Agent",
    },
    {
      name: "context",
      type: "object",
      required: false,
      description: "Optional context object (pipeline YAML, logs, error messages, etc.)",
    },
    {
      name: "conversation_id",
      type: "string",
      required: false,
      description: "Conversation ID for multi-turn conversations",
    },
  ],
};

export const devopsAgentToolset: ToolsetDefinition = {
  name: "devops-agent",
  displayName: "DevOps Agent (AIDA)",
  description:
    "Harness AI DevOps Agent — ask questions, get recommendations, and analyze pipelines using AI. Responses are streamed via SSE.",
  resources: [
    {
      resourceType: "devops_agent",
      displayName: "DevOps Agent",
      description:
        "Harness AI DevOps Agent. Use the 'ask' execute action to send a prompt and receive a streaming AI response.",
      toolset: "devops-agent",
      scope: "account",
      identifierFields: [],
      operations: {},
      executeActions: {
        ask: {
          method: "POST",
          path: "/gateway/aida/api/v1/chat",
          streaming: true,
          bodyBuilder: (input) => ({
            prompt: input.prompt,
            ...(input.context !== undefined && { context: input.context }),
            ...(input.conversation_id !== undefined && {
              conversation_id: input.conversation_id,
            }),
          }),
          responseExtractor: passthrough,
          actionDescription:
            "Send a prompt to the DevOps Agent and receive a streaming AI response. Requires 'prompt' field in body.",
          bodySchema: askBodySchema,
        },
      },
    },
  ],
};
