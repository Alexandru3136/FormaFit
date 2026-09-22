import "server-only";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{
        image_url?: {
          url: string;
        };
        text?: string;
        type: "text" | "image_url";
      }>;
};

type ChatOptions = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
};

function getOmniRouteConfig() {
  const apiKey = process.env.OMNIROUTE_API_KEY;
  const baseUrl = process.env.OMNIROUTE_BASE_URL ?? "http://localhost:20128/v1";
  const model = process.env.OMNIROUTE_MODEL ?? "auto";

  if (!apiKey) {
    throw new Error("Missing OMNIROUTE_API_KEY.");
  }

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/$/, ""),
    model,
  };
}

function extractContentFromSse(rawBody: string) {
  return rawBody
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.replace(/^data:\s*/, "").trim())
    .filter((line) => line && line !== "[DONE]")
    .map((line) => {
      try {
        const payload = JSON.parse(line) as {
          choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
        };
        return payload.choices?.[0]?.delta?.content ?? payload.choices?.[0]?.message?.content ?? "";
      } catch {
        return "";
      }
    })
    .join("");
}

function extractContent(rawBody: string) {
  try {
    const payload = JSON.parse(rawBody) as {
      choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content ?? payload.choices?.[0]?.delta?.content;
    if (content) return content;
  } catch {
    return extractContentFromSse(rawBody);
  }

  return extractContentFromSse(rawBody);
}

export async function requestOmniRouteChat({ messages, model, temperature = 0.3 }: ChatOptions) {
  const config = getOmniRouteConfig();

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    body: JSON.stringify({
      messages,
      model: model ?? config.model,
      stream: false,
      temperature,
    }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(`OmniRoute request failed with ${response.status}: ${rawBody.slice(0, 300)}`);
  }

  return extractContent(rawBody).trim();
}
