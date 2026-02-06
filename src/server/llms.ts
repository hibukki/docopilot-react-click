import { getPersistentStorage } from './storage';
import { STORAGE_KEYS, DEFAULT_MODEL } from '../shared/constants';

export const queryLLM = (prompt: string, schema: object): string => {
  const apiKey = getPersistentStorage(STORAGE_KEYS.API_KEY);
  if (!apiKey) {
    throw new Error(
      'Gemini API key not set. Please set it in the sidebar Settings.'
    );
  }

  const model = getPersistentStorage(STORAGE_KEYS.MODEL) || DEFAULT_MODEL;
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
    muteHttpExceptions: true,
  });

  const responseText = response.getContentText();
  if (response.getResponseCode() !== 200) {
    throw new Error(`Gemini API error ${response.getResponseCode()}: ${responseText}`);
  }

  const jsonResponse = JSON.parse(responseText);
  if (!jsonResponse.candidates?.length) {
    throw new Error(
      `No response from Gemini (possibly content-filtered): ${response.getContentText()}`
    );
  }
  return jsonResponse.candidates[0].content.parts[0].text;
};

export const listModels = (): { name: string; displayName: string }[] => {
  const apiKey = getPersistentStorage(STORAGE_KEYS.API_KEY);
  if (!apiKey) {
    throw new Error('API key must be set to list models.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    contentType: 'application/json',
    muteHttpExceptions: true,
  });

  const responseText = response.getContentText();
  if (response.getResponseCode() !== 200) {
    throw new Error(`Gemini API error ${response.getResponseCode()}: ${responseText}`);
  }

  const jsonResponse = JSON.parse(responseText);

  return jsonResponse.models
    .filter((m: { supportedGenerationMethods: string[] }) =>
      m.supportedGenerationMethods.includes('generateContent')
    )
    .map((m: { name: string; displayName: string }) => ({
      name: m.name.replace('models/', ''),
      displayName: m.displayName,
    }));
};
