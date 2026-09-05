import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleApi } from "./http/handler.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "..", "public");
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";
function json(response, status, body) { response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }); response.end(JSON.stringify(body)); }

async function writeWebResponse(response, webResponse) {
  const headers = Object.fromEntries(webResponse.headers.entries());
  response.writeHead(webResponse.status, headers);
  response.end(Buffer.from(await webResponse.arrayBuffer()));
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
    const apiResponse = await handleApi({ method: request.method, pathname: url.pathname, body: request.method === "POST" ? JSON.stringify(await readBody(request)) : undefined, env: process.env });
    if (apiResponse) return writeWebResponse(response, apiResponse);
    if (request.method === "GET") return staticFile(response, url.pathname);
    return json(response, 405, { error: "Method not allowed" });
  } catch (error) {
    const message = error.message === "GRAPH_CREDENTIAL_MISSING" ? "Live Graph credentials are not configured on the server." : "The live analysis request failed.";
    return json(response, 500, { error: { code: "REQUEST_FAILED", message } });
  }
});

server.listen(port, host, () => console.log(`AgencyAI Graph Financial Analyst listening on http://${host}:${port}`));
