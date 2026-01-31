import type { CopilotModule, IntentPattern, ParsedIntent } from './types';
import { getAllIntents } from './intents';
import { getSuggestions } from './module-context';

const REGEX_SCORE = 0.6;
const MAX_KEYWORD_SCORE = 0.3;
const MODULE_CONTEXT_BONUS = 0.1;
const MIN_SCORE_THRESHOLD = 0.2;

function scoreIntent(
  intent: IntentPattern,
  query: string,
  currentModule: CopilotModule
): number {
  const lowerQuery = query.toLowerCase();
  let score = 0;

  // Regex match (0.6)
  const hasRegexMatch = intent.patterns.some((p) => p.test(lowerQuery));
  if (hasRegexMatch) {
    score += REGEX_SCORE;
  } else {
    return 0; // no regex match = skip
  }

  // Keyword hits (0-0.3)
  if (intent.keywords.length > 0) {
    const hits = intent.keywords.filter((kw) => lowerQuery.includes(kw.toLowerCase()));
    const keywordRatio = hits.length / intent.keywords.length;
    score += keywordRatio * MAX_KEYWORD_SCORE;
  }

  // Module context bonus (0.1)
  if (intent.module === currentModule || currentModule === 'general') {
    score += MODULE_CONTEXT_BONUS;
  }

  return score;
}

export interface ParseResult {
  intent: ParsedIntent | null;
  fallbackSuggestions: string[];
}

export function parseIntent(query: string, currentModule: CopilotModule): ParseResult {
  const allIntents = getAllIntents();
  let bestIntent: ParsedIntent | null = null;
  let bestScore = 0;

  for (const intent of allIntents) {
    const score = scoreIntent(intent, query, currentModule);
    if (score > bestScore) {
      bestScore = score;
      const params = intent.extractParams ? intent.extractParams(query) : {};
      bestIntent = {
        intentId: intent.id,
        module: intent.module,
        action: intent.action,
        score,
        params,
      };
    }
  }

  if (bestIntent && bestIntent.score >= MIN_SCORE_THRESHOLD) {
    return { intent: bestIntent, fallbackSuggestions: [] };
  }

  return {
    intent: null,
    fallbackSuggestions: getSuggestions(currentModule),
  };
}
