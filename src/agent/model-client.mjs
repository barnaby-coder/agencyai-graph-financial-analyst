import { MODEL_INSTRUCTIONS, MODEL_OUTPUT_SCHEMA } from "./model-interpreter.mjs";

function safeMessage(status) {
  return `Model provider request failed (HTTP ${status})`;
}

export function createJsonModelGenerator({ endpoint = process.env.MODEL_API_URL, apiKey = process.env.MODEL_API_KEY, model = process.env.MODEL_NAME ?? "financial-analyst", fetchImpl = fetch, timeoutMs = 60000 } = {}) {
  if (!endpoint || !apiKey) return null;
  return async ({ packet }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const chatEndpoint = endpoint.endsWith("/chat/completions") ? endpoint : `${endpoint.replace(/\/$/, "")}/chat/completions`;
      const response = await fetchImpl(chatEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: `${MODEL_INSTRUCTIONS}\nReturn JSON matching this schema:\n${JSON.stringify(MODEL_OUTPUT_SCHEMA)}` },
            { role: "user", content: JSON.stringify(packet) }
          ],
          response_format: { type: "json_object" },
          thinking: { type: "disabled" },
          max_tokens: 1800,
          temperature: 0
        }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(safeMessage(response.status));
      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (typeof content === "string") return JSON.parse(content);
      if (payload?.output_text) return JSON.parse(payload.output_text);
      if (payload?.output && typeof payload.output === "object") return payload.output;
      if (payload?.result && typeof payload.result === "object") return payload.result;
      return payload;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("Model provider request timed out");
      throw new Error(error.message.replace(apiKey, "[REDACTED]"));
    } finally {
      clearTimeout(timer);
    }
  };
}

export function createOpenAIResponsesGenerator({ endpoint = process.env.OPENAI_API_URL ?? "https://api.openai.com/v1/responses", apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL ?? "gpt-5.6-luna", fetchImpl = fetch, timeoutMs = 60000 } = {}) {
  if (!apiKey) return null;
  return async ({ packet }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          instructions: `${MODEL_INSTRUCTIONS}\nReturn JSON matching this schema:\n${JSON.stringify(MODEL_OUTPUT_SCHEMA)}`,
          input: JSON.stringify(packet),
          text: {
            format: {
              type: "json_schema",
              name: "grounded_financial_answer",
              strict: true,
              schema: MODEL_OUTPUT_SCHEMA
            }
          },
          reasoning: { effort: "none" },
          max_output_tokens: 1800,
          store: false
        }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(safeMessage(response.status));
      const payload = await response.json();
      const content = typeof payload?.output_text === "string"
        ? payload.output_text
        : payload?.output?.flatMap((item) => item?.content ?? []).find((item) => typeof item?.text === "string")?.text;
      if (typeof content !== "string") throw new Error("Model provider returned no structured output");
      return JSON.parse(content);
    } catch (error) {
      if (error.name === "AbortError") throw new Error("Model provider request timed out");
      throw new Error(error.message.replace(apiKey, "[REDACTED]"));
    } finally {
      clearTimeout(timer);
    }
  };
}

export function createModelGenerator(options = {}) {
  if (options.openaiApiKey ?? process.env.OPENAI_API_KEY) {
    return createOpenAIResponsesGenerator({
      endpoint: options.openaiEndpoint ?? process.env.OPENAI_API_URL,
      apiKey: options.openaiApiKey ?? process.env.OPENAI_API_KEY,
      model: options.openaiModel ?? process.env.OPENAI_MODEL,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs
    });
  }
  return createJsonModelGenerator(options);
}
