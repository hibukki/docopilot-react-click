# Docopilot

Google Docs sidebar add-on that generates AI comments using Gemini. Click "Get Comments" and the LLM reviews your document, highlights quotes, and lets you click through them.

## Usage

1. Open the sidebar via the "Docopilot" menu
2. Enter your Gemini API key in Settings
3. Click "Get Comments" — quotes get highlighted in the doc
4. Click a comment to jump to the relevant quote

## Development

```shell
yarn install
yarn run login    # log in to clasp
yarn run setup    # create a new google doc connected to this script
yarn run deploy   # build + push to google apps script
```

Refresh the Google Doc, then use the "Docopilot" menu.

See `package.json` for other useful commands.

### Screenshot

<img width="1410" alt="image" src="https://github.com/user-attachments/assets/99c5b035-cbf2-42ab-ab3d-f9330a0a4da8" />

Settings:

<img width="329" alt="image" src="https://github.com/user-attachments/assets/96875fe7-fec0-4bba-9652-1e3ee966a6d9" />

## Architecture

**Backend** (Google Apps Script — only things that need GAS APIs):
- `doc.ts` — `getDocContent`, `highlightQuotesInDoc`, `moveCursorToQuote`
- `llms.ts` — `queryLLM(prompt, schema)`, `listModels()`
- `storage.ts` — `getPersistentStorage(key)`, `setPersistentStorage(key, value)`

**Frontend** (React sidebar — orchestration, defaults, domain logic):
- Builds the prompt, calls `queryLLM`, validates response with zod
- All constants (`DEFAULT_PROMPT`, `DEFAULT_MODEL`, `STORAGE_KEYS`)

## Fork

Based on [TypeScript-React-Google-Apps-Script](https://github.com/52inc/TypeScript-React-Google-Apps-Script).
