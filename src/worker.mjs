import { handleApi } from "./http/handler.mjs";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const apiResponse = await handleApi({
      method: request.method,
      pathname: url.pathname,
      body: request.method === "POST" ? await request.text() : undefined,
      env
    });
    if (apiResponse) return apiResponse;
    return env.ASSETS.fetch(request);
  }
};
