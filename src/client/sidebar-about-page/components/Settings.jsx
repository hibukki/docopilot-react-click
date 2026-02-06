import {
  Typography,
  Button,
  Collapse,
  TextField,
  Box,
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
  const [savedPrompt, setSavedPrompt] = useState('');
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);

  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSavingModel, setIsSavingModel] = useState(false);

  useEffect(() => {
    serverFunctions
      .getPersistentStorage(STORAGE_KEYS.USER_PROMPT)
      .then((stored) => {
        const prompt = stored || DEFAULT_PROMPT;
        setSavedPrompt(prompt);
        setPromptInput(prompt);
      })
      .catch((err) => onError(err));
  }, []);

  useEffect(() => {
    serverFunctions
      .getPersistentStorage(STORAGE_KEYS.MODEL)
      .then((model) => setSelectedModel(model || DEFAULT_MODEL))
      .catch((err) => onError(err));
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

  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    setIsSavingModel(true);
    serverFunctions
      .setPersistentStorage(STORAGE_KEYS.MODEL, model)
      .catch((err) => onError(err))
      .finally(() => setIsSavingModel(false));
  };

  const handleSavePrompt = () => {
    setIsSavingPrompt(true);
    const valueToStore = promptInput === DEFAULT_PROMPT ? '' : promptInput;
    serverFunctions
      .setPersistentStorage(STORAGE_KEYS.USER_PROMPT, valueToStore)
      .then(() => setSavedPrompt(promptInput))
      .catch((err) => onError(err))
      .finally(() => setIsSavingPrompt(false));
  };

  const handleCancelPrompt = () => {
    setPromptInput(savedPrompt);
  };

  const handleUseDefaultPrompt = () => {
    setPromptInput(DEFAULT_PROMPT);
    setIsSavingPrompt(true);
    serverFunctions
      .setPersistentStorage(STORAGE_KEYS.USER_PROMPT, '')
      .then(() => setSavedPrompt(DEFAULT_PROMPT))
      .catch((err) => onError(err))
      .finally(() => setIsSavingPrompt(false));
  };

  const promptChanged = promptInput !== savedPrompt;

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
            Gemini Model
          </Typography>
          {!hasApiKey ? (
            <Typography variant="caption" color="textSecondary">
              Set API key to load available models.
            </Typography>
          ) : isLoadingModels ? (
            <CircularProgress size={20} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="model-select-label">Select Model</InputLabel>
                <Select
                  labelId="model-select-label"
                  value={selectedModel}
                  label="Select Model"
                  onChange={handleModelChange}
                  disabled={isSavingModel}
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
              {isSavingModel && <CircularProgress size={16} />}
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 2, pl: 1, pr: 1 }}>
          <Typography variant="body2" gutterBottom>
            Prompt
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            size="small"
            variant="outlined"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSavePrompt}
              disabled={!promptChanged || isSavingPrompt}
              startIcon={isSavingPrompt ? <CircularProgress size={14} /> : null}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancelPrompt}
              disabled={!promptChanged}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleUseDefaultPrompt}
              disabled={isSavingPrompt}
            >
              Use Default
            </Button>
          </Box>
        </Box>
      </Collapse>
    </>
  );
};

export default Settings;
