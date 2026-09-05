import { MODEL_INSTRUCTIONS, MODEL_OUTPUT_SCHEMA } from "./model-interpreter.mjs";

function safeMessage(status) {
  return `Model provider request failed (HTTP ${status})`;
}

export function createJsonModelGenerator({ endpoint = process.env.MODEL_API_URL, apiKey = process.env.MODEL_API_KEY, model = process.env.MODEL_NAME ?? "financial-analyst", fetchImpl = fetch, timeoutMs = 15000 } = {}) {
  if (!endpoint || !apiKey) return null;
  return async ({ packet }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, system: MODEL_INSTRUCTIONS, input: packet, responseFormat: { type: "json", schema: MODEL_OUTPUT_SCHEMA } }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(safeMessage(response.status));
      const payload = await response.json();
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
