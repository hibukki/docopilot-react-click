import {
  Typography,
  Paper,
  useTheme,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState, useEffect, useRef, useMemo } from 'react';
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
  const [navigatingIndex, setNavigatingIndex] = useState(null);
  const lastCursorQuoteRef = useRef(null);
  const pendingNavigationQuoteRef = useRef(null);
  const activeCommentRef = useRef(null);
  const allQuotes = useMemo(() => comments.map((c) => c.quote), [comments]);

  useEffect(() => {
    return () => {
      serverFunctions.highlightQuotesInDoc([], null).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (comments.length === 0) return;
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const cursorCtx = await serverFunctions.getCursorContext();
        if (cancelled) return;
        const cursorQuote = findCursorQuote(cursorCtx, allQuotes);

        // If we're waiting for the server to reflect a sidebar-initiated
        // cursor move, ignore poll results until the cursor arrives at the
        // expected quote.
        const pendingQuote = pendingNavigationQuoteRef.current;
        if (pendingQuote) {
          if (cursorQuote === pendingQuote) {
            // Server caught up — resume normal polling.
            pendingNavigationQuoteRef.current = null;
            lastCursorQuoteRef.current = cursorQuote;
          }
          // Either way, don't override activeCommentIndex while pending.
        } else if (cursorQuote !== lastCursorQuoteRef.current) {
          lastCursorQuoteRef.current = cursorQuote;
          const idx = cursorQuote
            ? comments.findIndex((c) => c.quote === cursorQuote)
            : null;
          setActiveCommentIndex(idx === -1 ? null : idx);
          if (cancelled) return;
          await serverFunctions.highlightQuotesInDoc(allQuotes, cursorQuote);
        }
      } catch (err) {
        console.warn('Cursor poll error:', err);
      }
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

      const newQuotes = parsed.comments.map((c) => c.quote);
      await serverFunctions.highlightQuotesInDoc(newQuotes, null);
    } catch (err) {
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentClick = async (comment, index) => {
    setActiveCommentIndex(index);
    setNavigatingIndex(index);
    lastCursorQuoteRef.current = comment.quote;
    pendingNavigationQuoteRef.current = comment.quote;
    try {
      await serverFunctions.highlightQuotesInDoc(allQuotes, comment.quote);
      await serverFunctions.moveCursorToQuote(comment.quote);
    } catch (err) {
      pendingNavigationQuoteRef.current = null;
      onError(err);
    } finally {
      setNavigatingIndex(null);
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
      {hasApiKey === false && (
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
            key={`${comment.quote}-${i}`}
            ref={activeCommentIndex === i ? activeCommentRef : null}
            onClick={() => handleCommentClick(comment, i)}
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 1,
              border: '1px solid transparent',
              borderLeft: `3px solid ${theme.palette.secondary.main}`,
              borderRadius: theme.shape.borderRadius,
              cursor: 'pointer',
              transition:
                'background-color 0.15s, border-color 0.15s, box-shadow 0.15s',
              ...(activeCommentIndex === i && {
                border: `1px solid ${theme.palette.primary.main}`,
                borderLeftWidth: '3px',
                borderLeftColor: theme.palette.primary.main,
                backgroundColor: theme.palette.action.selected,
              }),
              '&:hover': {
                backgroundColor: alpha(theme.palette.secondary.main, 0.06),
                boxShadow: theme.shadows[1],
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {comment.comment}
              </Typography>
              {navigatingIndex === i && <CircularProgress size={14} />}
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default Comments;
