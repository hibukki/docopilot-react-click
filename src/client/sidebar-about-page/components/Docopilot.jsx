import { Typography, Box, Paper, Button } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';
import { STORAGE_KEYS } from '../../utils/constants';
import Settings from './Settings';
import Comments from './Comments';

const Docopilot = () => {
  const [lastError, setLastError] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyVersion, setApiKeyVersion] = useState(0);

  const handleError = (error) => {
    console.error('Docopilot caught error:', error);
    setLastError(error);
  };

  const clearError = () => {
    setLastError(null);
  };

  const checkApiKey = useCallback(() => {
    serverFunctions
      .getPersistentStorage(STORAGE_KEYS.API_KEY)
      .then((key) => setHasApiKey(!!key))
      .catch((err) => handleError(err));
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleApiKeySaved = () => {
    setHasApiKey(true);
    setApiKeyVersion((v) => v + 1);
  };

  return (
    <Box
      sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Typography
          variant="h6"
          sx={{
            pb: 1,
            mb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          Docopilot
        </Typography>

        <Comments onError={handleError} hasApiKey={hasApiKey} />

        <Settings
          onError={handleError}
          hasApiKey={hasApiKey}
          apiKeyVersion={apiKeyVersion}
          onApiKeySaved={handleApiKeySaved}
        />
      </Box>

      {lastError && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mt: 2,
            backgroundColor: 'error.light',
            border: '1px solid',
            borderColor: 'error.border',
            color: 'error.dark',
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
