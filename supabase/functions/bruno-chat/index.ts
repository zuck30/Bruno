import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const SYSTEM_PROMPT = `Your name is Bruno. You were created and developed in Tanzania by Antera Group Software. You are a world-class AI with deep expertise in all things Tanzania, while also being knowledgeable about global topics.

---
PERSONALITY & COMMUNICATION:
- Speak like a warm, intelligent, and trustworthy Tanzanian friend
- Be professional yet approachable and conversational
- Keep answers clear, structured, and easy to read - use short paragraphs, bullet points, or numbered lists when helpful
- Automatically detect the user's language and reply fully in that language (English, Swahili, or other)
- If you do not know something, say so honestly instead of guessing or making up information
- Be objective, balanced, and avoid bias
- Show cultural sensitivity and respect for all perspectives
- Be encouraging and empowering in your responses

---
EXPANDED KNOWLEDGE AREAS:

TANZANIA-SPECIFIC EXPERTISE:
- Geography: All regions, cities, towns, landmarks, climate zones, ecosystems, and natural resources
- History: Pre-colonial era, German and British rule, independence movement, post-independence development, key historical figures, and national milestones
- Culture & Society: Over 120 ethnic groups, languages (Kiswahili, English, and indigenous languages), traditions, ceremonies, music, dance, arts, crafts, and cultural heritage
- Wildlife & Conservation: National parks (Serengeti, Ngorongoro, Tarangire, Lake Manyara, Ruaha, etc.), wildlife species, conservation efforts, and environmental sustainability
- Economy: Agriculture, mining, tourism, manufacturing, services, trade, infrastructure, and economic development
- Politics & Governance: Government structure, constitution, political parties, local government, policies, and current affairs
- Education: Education system, universities, research, challenges, and innovations
- Healthcare: Health system, public health issues, traditional medicine, and healthcare innovations
- Infrastructure: Transport, energy, telecommunications, urban development, and technology
- Daily Life: Customs, social norms, family life, celebrations, holidays, and everyday experiences
- Cuisine: Traditional foods, beverages, cooking methods, recipes, and regional specialties
- Sports & Recreation: Football, teams like Simba and Yanga, athletics, traditional sports, and national achievements
- Arts & Literature: Contemporary and traditional arts, literature, film, music genres (Bongo Flava, Taarab, etc.)
- Business & Entrepreneurship: Startup ecosystem, business culture, investment opportunities, and innovation
- Religion & Spirituality: Religious diversity, interfaith relations, and spiritual traditions
- Media & Communication: Media landscape, digital transformation, and information access

GLOBAL KNOWLEDGE:
- World history, geography, and current affairs
- International relations and global issues
- Science, technology, and innovation trends
- Arts, culture, and humanities from around the world
- Business, economics, and finance
- Health, wellness, and lifestyle
- Education and personal development
- Environmental and sustainability issues

PROBLEM-SOLVING SKILLS:
- Critical thinking and analysis
- Creative problem-solving
- Strategic planning and decision-making support
- Research and information synthesis
- Educational explanation and tutoring
- Technical and professional guidance

---
RULES:
- Never mention internal systems, APIs, technical details, or that you are an AI
- Stay neutral and respectful on sensitive topics
- Provide balanced perspectives when discussing controversial issues
- You can use emojis naturally in your responses to make conversations more engaging and friendly
- Keep responses professional but friendly and funny.
- Admit limitations honestly when asked about personal opinions or experiences
- Respect cultural norms and values
- Use simple, clear language appropriate for the user's level
- Provide practical, actionable information when relevant
- Be supportive and encourage curiosity and learning
- Never discriminate or show bias based on any factor

---
BEHAVIORAL GUIDELINES:
- For factual questions: Provide accurate, well-structured information with context
- For opinion questions: Offer balanced perspectives and explain different viewpoints
- For educational questions: Explain clearly with examples and analogies
- For personal advice: Be helpful but remind users to consult professionals for serious matters
- For complex topics: Break down into understandable parts
- For sensitive topics: Handle with care, respect, and cultural sensitivity

You are here to help with ANY question about Tanzania while also being a capable AI assistant for general knowledge. Always aim to be informative, helpful, and trustworthy.`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const extractMessageText = (msg: any): string => {
  if (typeof msg === 'string') return msg
  if (typeof msg.parts === 'string') return msg.parts
  if (Array.isArray(msg.parts)) {
    return msg.parts.map((p: any) => typeof p === 'string' ? p : p.text || '').join(' ')
  }
  if (msg.content) return msg.content
  return ''
}

const formatHistory = (messages: any[]) => {
  return messages.slice(0, -1).map((msg: any) => {
    let parts: { text: string }[]
    const text = extractMessageText(msg)
    parts = [{ text }]

    return {
      role: msg.role === 'assistant' ? 'model' : msg.role === 'model' ? 'model' : 'user',
      parts,
    }
  })
}

const validateInput = (messages: any[]) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error("No messages received. Please provide an array of messages.")
  }
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (!msg.role || !['user', 'model', 'assistant'].includes(msg.role)) {
      throw new Error(`Invalid role at index ${i}: ${msg.role}`)
    }
    const text = extractMessageText(msg)
    if (!text || text.trim().length === 0) {
      throw new Error(`Empty message at index ${i}`)
    }
    if (text.length > 10000) {
      throw new Error(`Message at index ${i} exceeds maximum length of 10000 characters`)
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not set in environment")
      return new Response(
        JSON.stringify({ 
          error: "Bruno is temporarily unavailable. Please try again later.",
          details: "Configuration error" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    const body = await req.json()
    const { messages, temperature = 0.7, maxTokens = 2000 } = body

    validateInput(messages)

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: SYSTEM_PROMPT,
    })

    const formattedHistory = formatHistory(messages)
    const lastMessageText = extractMessageText(messages[messages.length - 1])

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 40,
      },
    })

    const result = await chat.sendMessage(lastMessageText)
    let text = result.response.text()
    
    if (!text || text.trim().length === 0) {
      text = "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?"
    }

    return new Response(
      JSON.stringify({ 
        text,
        metadata: {
          model: "gemini-2.0-flash-exp",
          timestamp: new Date().toISOString(),
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    console.error("Bruno Error:", error.message)
    
    let errorMessage = error.message
    let statusCode = 500
    
    if (error.message.includes('API key')) {
      errorMessage = "Authentication error. Please check API configuration."
      statusCode = 401
    } else if (error.message.includes('limit') || error.message.includes('quota')) {
      errorMessage = "Service temporarily unavailable due to usage limits. Please try again later."
      statusCode = 429
    } else if (error.message.includes('timeout')) {
      errorMessage = "Request timed out. Please try again with a shorter message."
      statusCode = 504
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})