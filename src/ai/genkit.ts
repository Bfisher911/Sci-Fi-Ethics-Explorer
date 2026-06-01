import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * Global default model for every `ai.generate` / `ai.definePrompt` call.
 *
 * NOTE: `gemini-2.0-flash` was RETIRED by Google (its `generateContent`
 * endpoint returns 404 "no longer available"), which silently broke every
 * AI feature. We pin to `gemini-2.5-flash` — the current stable flash model,
 * verified working against the production key. If Google retires this one
 * too, swap to `googleai/gemini-flash-latest` (a rolling alias that always
 * points at the newest flash) or the next stable `gemini-N.x-flash`.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
