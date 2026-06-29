import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

{/* Extract message text from various formats */}
const extractMessageText = (msg: any): string => {
  if (typeof msg === 'string') return msg
  if (typeof msg.parts === 'string') return msg.parts
  if (Array.isArray(msg.parts)) {
    return msg.parts.map((p: any) => typeof p === 'string' ? p : p.text || '').join(' ')
  }
  if (msg.content) return msg.content
  return ''
}

{/* Format messages for DeepSeek API */}
const formatMessagesForDeepSeek = (messages: any[]) => {
  {/* DeepSeek uses OpenAI-compatible format */}
  const formatted = []
  
  {/* Put system prompt as first message */}
  formatted.push({
    role: 'system',
    content: SYSTEM_PROMPT
  })
  
  {/* Add conversation history */}
  for (const msg of messages) {
    const role = msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user'
    const content = extractMessageText(msg)
    formatted.push({ role, content })
  }
  
  return formatted
}

{/* Validate input messages */}
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

{/* Search with Tavily */}
async function performSearch(query: string) {
  const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY')
  if (!TAVILY_API_KEY) {
    console.warn("TAVILY_API_KEY not configured, search disabled")
    return null
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
        include_raw_content: false,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Tavily API error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Tavily search error:', error)
    return null
  }
}

{/* Format search results */}
function formatSearchResults(searchData: any): string {
  if (!searchData) return ''
  
  let result = '\n\n SEARCH RESULTS\n'
  
  if (searchData.answer) {
    result += `\nSummary: ${searchData.answer}\n`
  }
  
  if (searchData.results && searchData.results.length > 0) {
    result += '\nSources:\n'
    searchData.results.forEach((r: any, i: number) => {
      result += `${i+1}. ${r.title}\n`
      result += `   ${r.snippet}\n`
      if (r.url) result += `   ${r.url}\n`
      result += '\n'
    })
  }
  
  return result
}

{/* Clean markdown from text */}
function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    .replace(/---/g, '')
    .replace(/~~/g, '')
    .replace(/`/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

{/* Main handler */}
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    {/* Check API keys */}
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    if (!DEEPSEEK_API_KEY) {
      console.error("DEEPSEEK_API_KEY not set in environment")
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

    {/* Parse request body */}
    const body = await req.json()
    const { 
      messages, 
      mode = 'normal', 
      temperature = 0.7, 
      maxTokens = 2000 
    } = body

    validateInput(messages)

    {/* Get user's latest query */}
    const userQuery = extractMessageText(messages[messages.length - 1])
    let finalMessages = formatMessagesForDeepSeek(messages)
    let searchData = null

    {/* Search mode: Get web results */}
    if (mode === 'search') {
      console.log('Search mode enabled, searching for:', userQuery)
      
      searchData = await performSearch(userQuery)
      
      if (searchData) {
        const formattedSearch = formatSearchResults(searchData)
        
        {/* Create enhanced system prompt with search results */}
        const searchSystemPrompt = SYSTEM_PROMPT + `
        
SEARCH MODE ACTIVE 
You have access to the following search results. Use them to provide accurate, up-to-date information.

${formattedSearch}

INSTRUCTIONS:
- Use the search results to answer the user's question accurately
- Cite sources when referencing specific information
- If the search results don't contain relevant information, say so honestly
- Combine your knowledge with search results for comprehensive answers
- Always prioritize accuracy over speculation
`
        
        {/* Rebuild messages with search-enhanced system prompt */}
        finalMessages = [
          { role: 'system', content: searchSystemPrompt },
          ...formatMessagesForDeepSeek(messages)
        ]
        
        console.log('Search completed, results found:', searchData.results?.length || 0)
      } else {
        console.log('Search failed or no results')
      }
    }

    {/* DeepThink mode: Enable thinking */}
    const model = 'deepseek-chat'
    let requestBody: any = {
      model: model,
      messages: finalMessages,
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: 0.95,
      stream: false
    }

    if (mode === 'deepthink') {
      console.log('DeepThink mode enabled, enabling reasoning')
      requestBody = {
        ...requestBody,
        thinking: { type: 'enabled' }
      }
    } else {
      requestBody = {
        ...requestBody,
        thinking: { type: 'disabled' }
      }
    }

    {/* Call DeepSeek API */}
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('DeepSeek API error:', response.status, errorData)
      throw new Error(errorData.error?.message || `DeepSeek API returned ${response.status}`)
    }

    const data = await response.json()
    let text = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a proper response."

    {/* Clean markdown from response */}
    text = cleanText(text)

    {/* Add source attribution for search mode */}
    if (mode === 'search' && searchData && searchData.results && searchData.results.length > 0) {
      const sources = searchData.results.slice(0, 3).map((r: any, i: number) => 
        `${i+1}. ${r.title} - ${r.url}`
      ).join('\n')
      
      if (sources) {
        text += `\n\n---\nSources:\n${sources}`
      }
    }

    {/* Return response */}
    return new Response(
      JSON.stringify({ 
        text,
        metadata: {
          model: model,
          mode: mode,
          timestamp: new Date().toISOString(),
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    console.error("Bruno Error:", error.message)
    
    let errorMessage = error.message
    let statusCode = 500
    
    if (error.message.includes('API key') || error.message.includes('401')) {
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