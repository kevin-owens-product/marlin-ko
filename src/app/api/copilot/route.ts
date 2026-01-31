import { NextRequest, NextResponse } from 'next/server';
import type { CopilotApiRequest, CopilotApiResponse } from '@/lib/copilot/types';
import { parseIntent } from '@/lib/copilot/intent-parser';
import { getSuggestions } from '@/lib/copilot/module-context';
import { getResolver } from './resolvers';

export async function POST(request: NextRequest) {
  try {
    const body: CopilotApiRequest = await request.json();
    const { query, module } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Missing or empty query' },
        { status: 400 }
      );
    }

    const { intent, fallbackSuggestions } = parseIntent(query.trim(), module || 'general');

    // No intent matched — return fallback suggestions
    if (!intent) {
      const response: CopilotApiResponse = {
        blocks: [
          {
            type: 'text',
            content: "I'm not sure what you're asking about. Here are some things I can help with:",
          },
        ],
        suggestions: fallbackSuggestions,
      };
      return NextResponse.json(response);
    }

    // Resolve the intent
    const resolver = getResolver(intent.module);
    const { blocks } = await resolver(intent);

    const response: CopilotApiResponse = {
      blocks,
      suggestions: getSuggestions(intent.module).slice(0, 3),
      intent: {
        id: intent.intentId,
        module: intent.module,
        action: intent.action,
        score: intent.score,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] POST /api/copilot error:', message);
    return NextResponse.json(
      {
        blocks: [{ type: 'error', message: 'An error occurred while processing your request.' }],
      } satisfies CopilotApiResponse,
      { status: 500 }
    );
  }
}
