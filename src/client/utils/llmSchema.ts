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

type GeminiSchema = {
  type: string;
  nullable?: boolean;
  properties?: Record<string, GeminiSchema>;
  required?: string[];
  items?: GeminiSchema;
};

const zodToGeminiSchema = (schema: z.ZodTypeAny): GeminiSchema => {
  if (schema instanceof z.ZodNullable) {
    return { ...zodToGeminiSchema(schema.unwrap()), nullable: true };
  }
  if (schema instanceof z.ZodString) {
    return { type: 'STRING' };
  }
  if (schema instanceof z.ZodArray) {
    return { type: 'ARRAY', items: zodToGeminiSchema(schema.element) };
  }
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, GeminiSchema> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToGeminiSchema(value as z.ZodTypeAny);
      required.push(key);
    }
    return { type: 'OBJECT', properties, required };
  }
  throw new Error(`zodToGeminiSchema: unsupported type ${schema.constructor.name}`);
};

// See https://ai.google.dev/gemini-api/docs/structured-output
export const llmResponseGeminiSchema = zodToGeminiSchema(LLMResponseSchema);
