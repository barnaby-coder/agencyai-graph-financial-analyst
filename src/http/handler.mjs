import { runLendingAnalysis } from "../graph/client.mjs";
import { createInterpreter } from "../agent/interpreter.mjs";
import { createModelGenerator } from "../agent/model-client.mjs";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function modelGenerator(env, fetchImpl) {
  return createModelGenerator({
    openaiApiKey: env.OPENAI_API_KEY,
    openaiEndpoint: env.OPENAI_API_URL,
    openaiModel: env.OPENAI_MODEL,
    apiKey: env.MODEL_API_KEY,
    endpoint: env.MODEL_API_URL,
    model: env.MODEL_NAME,
    fetchImpl
  });
}

function safeError(error) {
  if (error?.message === "GRAPH_CREDENTIAL_MISSING") return { code: "GRAPH_CREDENTIAL_MISSING", message: "Live Graph credentials are not configured on the server." };
  if (error?.message === "Graph query timed out") return { code: "GRAPH_TIMEOUT", message: "The live Graph request timed out." };
  return { code: "REQUEST_FAILED", message: "The live analysis request failed." };
}

export async function handleApi({ method, pathname, body, env = {}, fetchImpl = fetch } = {}) {
  const graphConfigured = Boolean(env.GRAPH_API_KEY);
  const modelConfigured = Boolean(env.OPENAI_API_KEY || (env.MODEL_API_KEY && env.MODEL_API_URL));
  if (method === "GET" && (pathname === "/health" || pathname === "/api/health")) return json({ ok: true, graphConfigured, modelConfigured });
  if (method !== "POST" || pathname !== "/api/analyze") return null;
  if (!graphConfigured) return json({ error: { code: "GRAPH_CREDENTIAL_MISSING", message: "Live Graph credentials are not configured on the server." } }, 503);
  let parsed;
  try { parsed = JSON.parse(body || "{}"); } catch { return json({ error: { code: "INVALID_REQUEST", message: "The request body must be valid JSON." } }, 400); }
  const question = typeof parsed.question === "string" ? parsed.question.trim() : "";
  if (question.length < 8 || question.length > 2_000) return json({ error: { code: "INVALID_QUESTION", message: "Ask a short financial question to analyze." } }, 400);
  try {
    const analysis = await runLendingAnalysis(question, { apiKey: env.GRAPH_API_KEY, fetchImpl });
    const answer = await createInterpreter({ generate: modelGenerator(env, fetchImpl) }).interpret(analysis);
    return json({ ...analysis, answer }, analysis.status === "unavailable" ? 503 : 200);
  } catch (error) {
    const failure = safeError(error);
    return json({ error: failure }, failure.code === "GRAPH_CREDENTIAL_MISSING" ? 503 : 500);
  }
}
