import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import {
  createOpenAiPortfolioDraft,
  createOpenAiPortfolioRequest,
  extractOpenAiResponseText,
  type PortfolioFields
} from "./src/frontend/lib/portfolioAi";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const openAiApiKey = env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY;
  const openAiModel = env.OPENAI_MODEL || env.VITE_OPENAI_MODEL || "gpt-5.2";

  return {
    plugins: [react(), portfolioApiPlugin(openAiApiKey, openAiModel)],
    server: {
      host: "127.0.0.1"
    },
    build: {
      target: "es2022"
    }
  };
});

function portfolioApiPlugin(openAiApiKey: string | undefined, openAiModel: string): Plugin {
  return {
    name: "qadamgraph-portfolio-api",
    configureServer(server) {
      server.middlewares.use("/api/portfolio", async (request, response) => {
        if (request.method !== "POST") {
          sendJson(response, 405, { error: { message: "Method not allowed" } });
          return;
        }

        if (!openAiApiKey) {
          sendJson(response, 500, {
            error: {
              message:
                "OpenAI key is not configured on the dev server. Add OPENAI_API_KEY to .env.local and restart npm.cmd run dev."
            }
          });
          return;
        }

        try {
          const body = (await readJsonBody(request)) as { fields?: PortfolioFields };

          if (!body.fields) {
            sendJson(response, 400, { error: { message: "Portfolio fields are missing." } });
            return;
          }

          const openAiResponse = await fetch(OPENAI_RESPONSES_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openAiApiKey}`
            },
            body: JSON.stringify(createOpenAiPortfolioRequest(body.fields, openAiModel))
          });

          if (!openAiResponse.ok) {
            const details = await readOpenAiError(openAiResponse);
            sendJson(response, openAiResponse.status, {
              error: {
                message: details || `OpenAI request failed with status ${openAiResponse.status}`
              }
            });
            return;
          }

          const data = (await openAiResponse.json()) as unknown;
          const text = extractOpenAiResponseText(data);

          if (!text) {
            sendJson(response, 502, {
              error: { message: "OpenAI response did not include text output." }
            });
            return;
          }

          sendJson(response, 200, createOpenAiPortfolioDraft(text, openAiModel));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Portfolio generation failed.";
          sendJson(response, 500, { error: { message } });
        }
      });
    }
  };
}

async function readJsonBody(request: IncomingMessage) {
  let raw = "";

  for await (const chunk of request) {
    raw += chunk;
  }

  return raw ? JSON.parse(raw) : {};
}

async function readOpenAiError(response: Response) {
  try {
    const data = (await response.json()) as { error?: { message?: string } };
    return data.error?.message;
  } catch {
    return "";
  }
}

function sendJson(response: ServerResponse, status: number, data: unknown) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(data));
}
