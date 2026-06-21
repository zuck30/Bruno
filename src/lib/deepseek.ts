export type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

export async function getBrunoResponse(messages: ChatMessage[], mode: 'normal' | 'deepthink' | 'search' = 'normal') {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase env missing:', { SUPABASE_URL, SUPABASE_ANON_KEY });
    throw new Error("Supabase environment variables missing");
  }

  try {
    console.log('Calling Bruno function with messages:', messages.length, 'mode:', mode);
    
    const res = await fetch(`${SUPABASE_URL}/functions/v1/bruno-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ messages, mode }),
    });

    console.log('Bruno function response status:', res.status);

    if (!res.ok) {
      let errorText = '';
      try {
        const errData = await res.json();
        errorText = errData.error || errData.message || JSON.stringify(errData);
      } catch (e) {
        errorText = await res.text();
      }
      
      console.error('Bruno function error:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText
      });
      
      throw new Error(errorText || `Bruno function returned ${res.status}`);
    }

    const data = await res.json();
    return data.text;
  } catch (error) {
    console.error('getBrunoResponse error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Bruno is temporarily unavailable. Please try again later.");
  }
}