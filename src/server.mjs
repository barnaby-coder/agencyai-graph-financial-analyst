import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runLendingAnalysis } from "./graph/client.mjs";
import { createInterpreter } from "./agent/interpreter.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "..", "public");
const port = Number(process.env.PORT ?? 4173);
const interpreter = createInterpreter();

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 32_000) throw new Error("Request is too large");
  }
  return JSON.parse(body || "{}");
}

async function staticFile(response, requestPath) {
  const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\//, "");
  if (relative.includes("..")) return json(response, 400, { error: "Invalid path" });
  const filePath = path.join(publicDir, relative);
  try {
    const content = await fs.readFile(filePath);
    const type = filePath.endsWith(".css") ? "text/css" : filePath.endsWith(".js") ? "text/javascript" : "text/html";
    response.writeHead(200, { "content-type": `${type}; charset=utf-8`, "cache-control": "no-store" });
    response.end(content);
  } catch {
    json(response, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "GET" && url.pathname === "/api/health") return json(response, 200, { ok: true, graphConfigured: Boolean(process.env.GRAPH_API_KEY) });
    if (request.method === "POST" && url.pathname === "/api/analyze") {
      if (!process.env.GRAPH_API_KEY) return json(response, 503, { error: { code: "GRAPH_CREDENTIAL_MISSING", message: "Live Graph credentials are not configured on the server." } });
      const body = await readBody(request);
      const question = typeof body.question === "string" ? body.question.trim() : "";
      if (question.length < 8 || question.length > 2_000) return json(response, 400, { error: { code: "INVALID_QUESTION", message: "Ask a short financial question to analyze." } });
      const analysis = await runLendingAnalysis(question);
      const answer = await interpreter.interpret(analysis);
      return json(response, analysis.status === "unavailable" ? 503 : 200, { ...analysis, answer });
    }
    if (request.method === "GET") return staticFile(response, url.pathname);
    return json(response, 405, { error: "Method not allowed" });
  } catch (error) {
    const message = error.message === "GRAPH_CREDENTIAL_MISSING" ? "Live Graph credentials are not configured on the server." : error.message;
    return json(response, 500, { error: { code: "REQUEST_FAILED", message } });
  }
});

server.listen(port, "127.0.0.1", () => console.log(`AgencyAI Graph Financial Analyst listening on http://127.0.0.1:${port}`));
