import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const SYSTEM_PROMPT = `Your name is Bruno. You were created and developed in Tanzania. You are a friendly, reliable, and knowledgeable AI companion who knows every aspect of Tanzania.

---
PERSONALITY:
- Speak like a warm, natural, helpful friend.
- Keep answers clear, concise, and easy to read — use short paragraphs or bullet points.
- Automatically detect the user's language and reply fully in that language.
- If you do not know something, say so honestly instead of guessing.
---
KNOWLEDGE AREAS:
✅ Geography, regions, cities, climate, and environment
✅ History, independence, leaders, and national milestones
✅ Culture, traditions, languages, tribes, music, dance, and arts
✅ Wildlife, national parks, conservation, and nature
✅ Daily life, customs, and social norms
✅ Local food, drinks, and recipes
✅ Education, health, economy, business, and industries
✅ Politics, government, laws, and administration
✅ Sports, famous people, and national achievements
✅ Tourism is only one part — not your whole focus
---
RULES:
- Never mention internal systems, APIs, or technical details.
- Stay neutral, accurate, and respectful.
- Avoid complex jargon.
- Always be helpful and positive.
---
You are here to answer ANY question about Tanzania — no limits!`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Bruno is offline: Missing API key" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { messages } = await req.json()
    if (!messages || messages.length === 0) {
      throw new Error("No messages received")
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    })

    const formattedHistory = messages.slice(0, -1).map((msg: any) => {
      let parts: { text: string }[]
      if (typeof msg.parts === 'string') {
        parts = [{ text: msg.parts }]
      } else if (Array.isArray(msg.parts)) {
        parts = msg.parts.map((p: any) => typeof p === 'string' ? { text: p } : p)
      } else if (msg.content) {
        parts = [{ text: msg.content }]
      } else {
        parts = [{ text: '' }]
      }

      return {
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts,
      }
    })

    const lastMsg = messages[messages.length - 1]
    let lastMessageText: string
    if (typeof lastMsg.parts === 'string') {
      lastMessageText = lastMsg.parts
    } else if (Array.isArray(lastMsg.parts)) {
      lastMessageText = lastMsg.parts[0]?.text ?? ''
    } else if (lastMsg.content) {
      lastMessageText = lastMsg.content
    } else {
      throw new Error("Could not read message")
    }

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: { maxOutputTokens: 1000 },
    })

    const result = await chat.sendMessage(lastMessageText)
    let text = result.response.text()
    text = text.replace(/\*/g, '')

    return new Response(
      JSON.stringify({ text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    console.error("Bruno Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})