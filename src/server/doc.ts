export const getDocContent = () => {
  const doc = DocumentApp.getActiveDocument();
  return doc.getBody().getText();
};

const HIGHLIGHT_COLOR = '#FFF8C4';
const FOCUSED_HIGHLIGHT_COLOR = '#FFD54F';

const applyHighlight = (
  body: GoogleAppsScript.Document.Body,
  searchText: string,
  color: string
) => {
  let searchResult = body.findText(searchText);
  while (searchResult) {
    const element = searchResult.getElement();
    if (element.getType() === DocumentApp.ElementType.TEXT) {
      const textElement = element.asText();
      const start = searchResult.getStartOffset();
      const end = searchResult.getEndOffsetInclusive();
      if (start !== -1 && end !== -1) {
        textElement.setBackgroundColor(start, end, color);
      }
    }
    searchResult = body.findText(searchText, searchResult);
  }
};

export const highlightQuotesInDoc = (
  quotesToHighlight: string[],
  quoteInFocus: string | null = null
) => {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();

  let clearSearchResult = body.findText('.+');
  while (clearSearchResult) {
    const element = clearSearchResult.getElement();
    if (element.getType() === DocumentApp.ElementType.TEXT) {
      const textElement = element.asText();
      const start = clearSearchResult.getStartOffset();
      const end = clearSearchResult.getEndOffsetInclusive();
      if (start !== -1 && end !== -1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        textElement.setBackgroundColor(start, end, null as any);
      }
    }
    clearSearchResult = body.findText('.+', clearSearchResult);
  }

  quotesToHighlight.forEach((quote) => {
    if (quote.trim() && quote !== quoteInFocus) {
      applyHighlight(body, quote, HIGHLIGHT_COLOR);
    }
  });

  if (quoteInFocus?.trim()) {
    applyHighlight(body, quoteInFocus, FOCUSED_HIGHLIGHT_COLOR);
  }
};

export const moveCursorToQuote = (quote: string) => {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const rangeElement = body.findText(quote);
  if (rangeElement) {
    const element = rangeElement.getElement();
    const startOffset = rangeElement.getStartOffset();
    const position = doc.newPosition(element, startOffset);
    doc.setCursor(position);
  }
};
