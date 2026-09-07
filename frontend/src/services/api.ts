import { AskResponse, UserMarket } from "../types";

const API_URL = "https://pc-builder-ai-e9w7.onrender.com";

export async function askAI(
  question: string,
  history: any,
  market?: UserMarket
): Promise<AskResponse> {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify({
      question,
      history,

      country: market?.country ?? "",
      currency: market?.currency ?? "",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : `Server error: ${response.status}`
    );
  }

  return data;
}