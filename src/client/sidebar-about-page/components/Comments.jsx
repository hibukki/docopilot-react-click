import {
  Typography,
  Paper,
  useTheme,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';
import { STORAGE_KEYS, DEFAULT_PROMPT } from '../../utils/constants';
import { LLMResponseSchema, llmResponseGeminiSchema } from '../../utils/llmSchema';

const findCursorQuote = (cursorCtx, quotes) => {
  if (!cursorCtx) return null;
  const { text, offset } = cursorCtx;
  for (const quote of quotes) {
    const idx = text.indexOf(quote);
    if (idx !== -1 && offset >= idx && offset <= idx + quote.length) {
      return quote;
    }
  }
  return null;
};

const Comments = ({ onError, hasApiKey }) => {
  const theme = useTheme();
  const [comments, setComments] = useState([]);
  const [activeCommentIndex, setActiveCommentIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastCursorQuoteRef = useRef(null);
  const activeCommentRef = useRef(null);

  useEffect(() => {
    if (comments.length === 0) return;
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const cursorCtx = await serverFunctions.getCursorContext();
        if (cancelled) return;
        const allQuotes = comments.map((c) => c.quote);
        const cursorQuote = findCursorQuote(cursorCtx, allQuotes);
        if (cursorQuote !== lastCursorQuoteRef.current) {
          lastCursorQuoteRef.current = cursorQuote;
          const idx = cursorQuote
            ? comments.findIndex((c) => c.quote === cursorQuote)
            : null;
          setActiveCommentIndex(idx === -1 ? null : idx);
          await serverFunctions.highlightQuotesInDoc(allQuotes, cursorQuote);
        }
      } catch {}
      if (!cancelled) setTimeout(poll, 1500);
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [comments]);

  useEffect(() => {
    if (activeCommentRef.current) {
      activeCommentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeCommentIndex]);

  const handleGetComments = async () => {
    setIsLoading(true);
    try {
      const [docText, storedPrompt] = await Promise.all([
        serverFunctions.getDocContent(),
        serverFunctions.getPersistentStorage(STORAGE_KEYS.USER_PROMPT),
      ]);

      const prompt = storedPrompt || DEFAULT_PROMPT;
      const fullPrompt = `${prompt}\n\nDocument Text:\n\`\`\`\n${docText}\n\`\`\``;

      const rawResponse = await serverFunctions.queryLLM(
        fullPrompt,
        llmResponseGeminiSchema
      );
      const parsed = LLMResponseSchema.parse(JSON.parse(rawResponse));

      setComments(parsed.comments);
      setActiveCommentIndex(null);

      const allQuotes = parsed.comments.map((c) => c.quote);
      await serverFunctions.highlightQuotesInDoc(allQuotes, null);
    } catch (err) {
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentClick = async (comment, index) => {
    setActiveCommentIndex(index);
    lastCursorQuoteRef.current = comment.quote;
    const allQuotes = comments.map((c) => c.quote);
    try {
      await serverFunctions.highlightQuotesInDoc(allQuotes, comment.quote);
      await serverFunctions.moveCursorToQuote(comment.quote);
    } catch (err) {
      onError(err);
    }
  };

  return (
    <Box sx={{ mt: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleGetComments}
          disabled={isLoading || !hasApiKey}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
          sx={{ flexGrow: 1 }}
        >
          {isLoading ? 'Loading...' : 'Get Comments'}
        </Button>
      </Box>
      {!hasApiKey && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Set your Gemini API key in Settings below to get started.
        </Typography>
      )}
      {comments.length === 0 && hasApiKey ? (
        <Typography variant="body2" color="textSecondary">
          Click "Get Comments" to analyze the document.
        </Typography>
      ) : (
        comments.map((comment, i) => (
          <Paper
            key={i}
            ref={activeCommentIndex === i ? activeCommentRef : null}
            onClick={() => handleCommentClick(comment, i)}
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 1,
              border: '1px solid transparent',
              borderLeft: `4px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              cursor: 'pointer',
              transition:
                'transform 0.1s ease-in-out, background-color 0.1s ease-in-out, border 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
              ...(activeCommentIndex === i && {
                border: `1px solid ${theme.palette.primary.main}`,
                borderLeftWidth: '4px',
                borderLeftColor: theme.palette.primary.main,
                backgroundColor: theme.palette.action.selected,
              }),
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                transform: 'scale(1.01)',
                boxShadow: theme.shadows[2],
              },
            }}
          >
            <Typography variant="body2">{comment.comment}</Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default Comments;
