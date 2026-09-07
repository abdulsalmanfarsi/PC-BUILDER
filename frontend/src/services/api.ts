import { AskResponse, UserMarket } from "../types";

const API_URL = "https://pc-builder-ai-e9w7.onrender.com";
const REQUEST_TIMEOUT = 60000;

export async function askAI(
  question: string,
  history: any,
  market?: UserMarket
): Promise<AskResponse> {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    let response: Response;

    try {
      response = await fetch(`${API_URL}/ask`, {
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

        signal: controller.signal,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new Error(
          "The request took too long. Please try again."
        );
      }

      throw new Error(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    }

    let data: unknown;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "The server returned an invalid response. Please try again."
      );
    }

    if (!response.ok) {
      const detail =
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof (data as { detail?: unknown }).detail === "string"
          ? (data as { detail: string }).detail
          : `Server error: ${response.status}`;

      throw new Error(detail);
    }

    if (
      typeof data !== "object" ||
      data === null ||
      !("answer" in data) ||
      typeof (data as { answer?: unknown }).answer !== "string" ||
      !("history" in data)
    ) {
      throw new Error(
        "The server returned an incomplete response. Please try again."
      );
    }

    return data as AskResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}