// Mistral AI integration — alternative LLM provider for the AI assistant.
// Uses @mistralai/mistralai SDK with the Kenya GovDash data as context.
//
// Set MISTRAL_API_KEY env var to enable. Falls back to z-ai-web-dev-sdk if
// Mistral key is not configured.
//
// Get a free API key at: https://console.mistral.ai/

import { Mistral } from '@mistralai/mistralai';

let client: Mistral | null = null;

function getClient(): Mistral | null {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new Mistral({ apiKey });
  }
  return client;
}

export async function mistralChat(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: string; content: string }> = [],
): Promise<string | null> {
  const mistral = getClient();
  if (!mistral) return null;

  try {
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
      { role: 'user', content: userMessage },
    ];

    const response = await mistral.chat.complete({
      model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
      messages,
      temperature: 0.3,
      maxTokens: 800,
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map((c: any) => c.text || '').join('');
    }
    return null;
  } catch (err) {
    console.error('[mistral] chat failed:', err);
    return null;
  }
}

export function isMistralConfigured(): boolean {
  return !!process.env.MISTRAL_API_KEY;
}

export function getActiveProvider(): 'mistral' | 'z-ai' | 'rule-based' {
  if (process.env.MISTRAL_API_KEY) return 'mistral';
  // z-ai-web-dev-sdk is always available (bundled with the platform)
  return 'z-ai';
}
