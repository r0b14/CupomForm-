import { Answers, Campaign, Result } from "./types";

export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export function apiError(payload: unknown): string {
  if (typeof payload === "object" && payload && "message" in payload) {
    const message = (payload as { message: unknown }).message;
    return Array.isArray(message) ? message.join(", ") : String(message);
  }
  return "Não foi possível concluir agora. Tente novamente.";
}

export async function fetchCampaign(): Promise<Campaign> {
  const response = await fetch(`${apiUrl}/campaign`);
  const payload = await response.json();
  if (!response.ok) throw new Error(apiError(payload));
  return payload;
}

export async function submitSubmission(data: {
  name: string;
  phone: string;
  answers: Answers;
  consent: boolean;
}): Promise<Result> {
  const response = await fetch(`${apiUrl}/submissions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(apiError(payload));
  return payload;
}

export async function requestDelivery(submissionId: string): Promise<void> {
  const response = await fetch(
    `${apiUrl}/submissions/${submissionId}/delivery`,
    { method: "POST" }
  );
  const payload = await response.json();
  if (!response.ok) throw new Error(apiError(payload));
}
