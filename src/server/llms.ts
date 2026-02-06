import { getPersistentStorage } from './storage';

// Must match STORAGE_KEYS and DEFAULT_MODEL in client/utils/constants.ts
const API_KEY_STORAGE_KEY = 'api_key';
const MODEL_STORAGE_KEY = 'model';
const DEFAULT_MODEL = 'gemini-2.0-flash-thinking-exp-1219';

export const queryLLM = (prompt: string, schema: object): string => {
  const apiKey = getPersistentStorage(API_KEY_STORAGE_KEY);
  if (!apiKey) {
    throw new Error(
      'Gemini API key not set. Please set it in the sidebar Settings.'
    );
  }

  const model = getPersistentStorage(MODEL_STORAGE_KEY) || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: false,
  });

  const jsonResponse = JSON.parse(response.getContentText());
  return jsonResponse.candidates[0].content.parts[0].text;
};

export const listModels = (): { name: string; displayName: string }[] => {
  const apiKey = getPersistentStorage(API_KEY_STORAGE_KEY);
  if (!apiKey) {
    throw new Error('API key must be set to list models.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    contentType: 'application/json',
    muteHttpExceptions: false,
  });

  const jsonResponse = JSON.parse(response.getContentText());

  return jsonResponse.models
    .filter((m: { supportedGenerationMethods: string[] }) =>
      m.supportedGenerationMethods.includes('generateContent')
    )
    .map((m: { name: string; displayName: string }) => ({
      name: m.name.replace('models/', ''),
      displayName: m.displayName,
    }));
};
