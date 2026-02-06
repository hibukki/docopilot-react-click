import {
  Typography,
  Button,
  Collapse,
  TextField,
  Box,
  Paper,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Link,
  Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';
import { STORAGE_KEYS, DEFAULT_MODEL, DEFAULT_PROMPT } from '../../utils/constants';

const Settings = ({ onError, hasApiKey, apiKeyVersion, onApiKeySaved }) => {
  const theme = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [currentModelDisplay, setCurrentModelDisplay] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    serverFunctions
      .getPersistentStorage(STORAGE_KEYS.USER_PROMPT)
      .then((stored) => setCurrentPrompt(stored || DEFAULT_PROMPT))
      .catch((err) => onError(err));
  }, []);

  useEffect(() => {
    serverFunctions
      .getPersistentStorage(STORAGE_KEYS.MODEL)
      .then((model) => {
        setCurrentModelDisplay(model || `Default (${DEFAULT_MODEL})`);
        setSelectedModel(model || '');
      })
      .catch((err) => {
        onError(err);
        setCurrentModelDisplay('Error fetching model');
      });
  }, []);

  useEffect(() => {
    if (!hasApiKey) {
      setAvailableModels([]);
      return;
    }
    setIsLoadingModels(true);
    serverFunctions
      .listModels()
      .then(setAvailableModels)
      .catch((err) => {
        onError(err);
        setAvailableModels([]);
      })
      .finally(() => setIsLoadingModels(false));
  }, [hasApiKey, apiKeyVersion]);

  const handleSaveApiKey = () => {
    serverFunctions
      .setPersistentStorage(STORAGE_KEYS.API_KEY, apiKeyInput)
      .then(() => {
        setApiKeyInput('');
        onApiKeySaved();
      })
      .catch((err) => onError(err));
  };

  const handleSavePrompt = () => {
    serverFunctions
      .setPersistentStorage(STORAGE_KEYS.USER_PROMPT, promptInput)
      .then(() => {
        setCurrentPrompt(promptInput || DEFAULT_PROMPT);
        setPromptInput('');
      })
      .catch((err) => onError(err));
  };

  const handleSaveModel = () => {
    if (!selectedModel) return;
    serverFunctions
      .setPersistentStorage(STORAGE_KEYS.MODEL, selectedModel)
      .then(() => {
        setCurrentModelDisplay(selectedModel);
      })
      .catch((err) => onError(err));
  };

  const isModelSaveDisabled = () => {
    if (isLoadingModels || !selectedModel) return true;
    const currentActiveModel = currentModelDisplay.startsWith('Default')
      ? ''
      : currentModelDisplay;
    return selectedModel === currentActiveModel;
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
          cursor: 'pointer',
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 1,
        }}
        onClick={() => setSettingsOpen(!settingsOpen)}
      >
        <Typography variant="subtitle1">
          {settingsOpen ? '[-] Settings' : '[+] Settings'}
        </Typography>
        <Chip
          label={hasApiKey ? 'API key set' : 'No API key'}
          size="small"
          color={hasApiKey ? 'success' : 'warning'}
          variant="outlined"
        />
      </Box>
      <Collapse in={settingsOpen}>
        <Box sx={{ mb: 2, pl: 1, pr: 1 }}>
          <Typography variant="body2" gutterBottom>
            Gemini API Key
          </Typography>
          <TextField
            fullWidth
            type="password"
            size="small"
            variant="outlined"
            placeholder={hasApiKey ? 'Key is set (enter new to replace)' : 'Enter your Gemini API Key'}
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveApiKey}
            disabled={!apiKeyInput}
          >
            Save Key
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            <Link
              href="https://ai.google.dev/gemini-api/docs/api-key"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to get a Gemini API Key
            </Link>
          </Typography>
        </Box>
        <Box sx={{ mb: 2, pl: 1, pr: 1 }}>
          <Typography variant="body2" gutterBottom>
            Custom Prompt
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            size="small"
            variant="outlined"
            placeholder="Enter custom prompt (leave blank for default)"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button variant="contained" size="small" onClick={handleSavePrompt}>
            Save Prompt
          </Button>
        </Box>
        <Box sx={{ mb: 2, pl: 1, pr: 1 }}>
          <Typography variant="body2" gutterBottom>
            Gemini Model
          </Typography>
          {!hasApiKey ? (
            <Typography variant="caption" color="textSecondary">
              Set API key to load available models.
            </Typography>
          ) : isLoadingModels ? (
            <CircularProgress size={20} />
          ) : (
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel id="model-select-label">Select Model</InputLabel>
              <Select
                labelId="model-select-label"
                value={selectedModel}
                label="Select Model"
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {availableModels.map((model) => (
                  <MenuItem key={model.name} value={model.name}>
                    <Typography variant="caption">
                      {model.displayName} ({model.name})
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveModel}
            disabled={isModelSaveDisabled()}
          >
            Save Model
          </Button>
        </Box>
        <Box sx={{ mb: 2, pl: 1, pr: 1 }}>
          <Typography variant="body2" gutterBottom>
            Current Active Prompt:
          </Typography>
          <Paper
            variant="outlined"
            sx={{ p: 1, backgroundColor: theme.palette.background.default }}
          >
            <Typography
              variant="caption"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {currentPrompt || 'Using default prompt'}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ mb: 2, pl: 1, pr: 1 }}>
          <Typography variant="body2" gutterBottom>
            Current Active Model:
          </Typography>
          <Paper
            variant="outlined"
            sx={{ p: 1, backgroundColor: theme.palette.background.default }}
          >
            <Typography
              variant="caption"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {currentModelDisplay}
            </Typography>
          </Paper>
        </Box>
      </Collapse>
    </>
  );
};

export default Settings;
