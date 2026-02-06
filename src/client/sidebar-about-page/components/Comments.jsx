import {
  Typography,
  Paper,
  useTheme,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { useState } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';
import { STORAGE_KEYS, DEFAULT_PROMPT } from '../../utils/constants';
import { LLMResponseSchema, llmResponseJsonSchema } from '../../utils/llmSchema';

const Comments = ({ onError }) => {
  const theme = useTheme();
  const [comments, setComments] = useState([]);
  const [activeCommentIndex, setActiveCommentIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
        llmResponseJsonSchema
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
    const allQuotes = comments.map((c) => c.quote);
    try {
      await serverFunctions.highlightQuotesInDoc(allQuotes, comment.quote);
      await serverFunctions.moveCursorToQuote(comment.quote);
    } catch (err) {
      onError(err);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          Comments
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleGetComments}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isLoading ? 'Loading...' : 'Get Comments'}
        </Button>
      </Box>
      {comments.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No comments yet. Click "Get Comments" to analyze the document.
        </Typography>
      ) : (
        comments.map((comment, i) => (
          <Paper
            key={i}
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
