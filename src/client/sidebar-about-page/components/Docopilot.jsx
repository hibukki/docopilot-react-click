import { Typography, Box, Paper, Button } from '@mui/material';
import { useState } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';
import Settings from './Settings';
import Comments from './Comments';

const Docopilot = () => {
  const [lastError, setLastError] = useState(null);
  const [debugResult, setDebugResult] = useState(null);

  const handleError = (error) => {
    console.error('Docopilot caught error:', error);
    setLastError(error);
  };

  const clearError = () => {
    setLastError(null);
  };

  const handleDebugStorage = async () => {
    try {
      const result = await serverFunctions.debugStorage();
      setDebugResult(result);
    } catch (err) {
      setDebugResult(`Call failed: ${err}`);
    }
  };

  return (
    <Box
      sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Docopilot
        </Typography>

        <Box sx={{ mb: 2, p: 1, border: '1px dashed grey' }}>
          <Button size="small" variant="outlined" onClick={handleDebugStorage}>
            Debug Storage
          </Button>
          {debugResult && (
            <Typography variant="caption" component="pre" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              {debugResult}
            </Typography>
          )}
        </Box>

        <Settings onError={handleError} />

        <Comments onError={handleError} />
      </Box>

      {lastError && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mt: 2,
            backgroundColor: 'error.light',
            color: 'error.contrastText',
            maxHeight: '30%',
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="subtitle2">Last Error:</Typography>
            <Button size="small" onClick={clearError} color="inherit">
              Dismiss
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {lastError.message || String(lastError)}
          </Typography>
          {lastError.stack && (
            <Typography
              component="pre"
              variant="caption"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
            >
              {lastError.stack}
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default Docopilot;
