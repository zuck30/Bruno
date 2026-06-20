export type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

export async function getBrunoResponse(messages: ChatMessage[]) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment variables missing");
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/bruno-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to get response from Bruno");
  }

  const data = await res.json();
  return data.text;
}