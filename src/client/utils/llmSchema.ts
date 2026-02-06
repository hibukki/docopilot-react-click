import { z } from 'zod';

export const LLMResponseSchema = z.object({
  thinking: z.string().nullable(),
  comments: z.array(
    z.object({
      quote: z.string(),
      comment: z.string(),
    })
  ),
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

// JSON Schema for Gemini's responseSchema parameter — must stay in sync with LLMResponseSchema above.
// Nullable via type array per https://ai.google.dev/gemini-api/docs/structured-output
export const llmResponseJsonSchema = {
  type: 'object',
  properties: {
    thinking: { type: ['string', 'null'] },
    comments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quote: { type: 'string' },
          comment: { type: 'string' },
        },
        required: ['quote', 'comment'],
      },
    },
  },
  required: ['thinking', 'comments'],
};
