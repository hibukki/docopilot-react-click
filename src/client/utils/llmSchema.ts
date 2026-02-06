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

// Gemini Schema for the responseSchema REST parameter — must stay in sync with LLMResponseSchema above.
// Uses Gemini's schema format (uppercase types, nullable field) not JSON Schema.
// See https://ai.google.dev/gemini-api/docs/structured-output
export const llmResponseGeminiSchema = {
  type: 'OBJECT',
  properties: {
    thinking: { type: 'STRING', nullable: true },
    comments: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          quote: { type: 'STRING' },
          comment: { type: 'STRING' },
        },
        required: ['quote', 'comment'],
      },
    },
  },
  required: ['thinking', 'comments'],
};
