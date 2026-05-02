import OpenAI from 'openai'

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
})

export const MODELS = {
  GPT: 'openai/gpt-4o-mini',
  CLAUDE: 'anthropic/claude-haiku-3',
  GEMINI: 'google/gemini-flash-1.5',
  ORCHESTRATOR: 'openai/gpt-4o-mini',
} as const

export async function chat(model: string, prompt: string): Promise<string> {
  const res = await openrouter.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  })
  return res.choices[0].message.content ?? ''
}
