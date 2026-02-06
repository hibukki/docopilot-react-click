export const STORAGE_KEYS = {
  API_KEY: 'api_key',
  USER_PROMPT: 'user_prompt',
  MODEL: 'model',
} as const;

export const DEFAULT_MODEL = 'gemini-2.0-flash-thinking-exp-1219';

export const DEFAULT_PROMPT = `Please review the following document text and find comments that might be helpful to the user. They will be displayed in a sidebar.

First, provide your reasoning or thought process in the 'thinking' field. Then, provide the comments in the 'comments' field.

Each comment must include an exact quote from the document text and your feedback on it.`;
