import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Docopilot from './components/Docopilot';

// Editorial Copilot theme — warm ink tones, serif headings
const theme = createTheme({
  palette: {
    primary: {
      main: '#2c5282', // warm ink blue
    },
    secondary: {
      main: '#c75c3a', // muted coral / editor's pen
    },
    background: {
      default: '#faf8f5', // warm off-white, like quality paper
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e', // deep charcoal
      secondary: '#6b7280', // warm gray
    },
    divider: '#e8e4df', // soft warm gray
    action: {
      hover: 'rgba(44, 82, 130, 0.06)',
      selected: 'rgba(44, 82, 130, 0.10)',
      focus: 'rgba(44, 82, 130, 0.12)',
    },
  },
  typography: {
    fontFamily: "'Source Sans 3', 'Helvetica Neue', sans-serif",
    h6: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 700,
    },
    subtitle1: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 600,
      fontSize: '0.95rem',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: '#e8e4df',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
        },
        outlinedPrimary: {
          textTransform: 'none',
          fontWeight: 600,
          borderColor: '#e8e4df',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#e8e4df' },
          },
        },
      },
    },
  },
});

const container = document.getElementById('index');
const root = createRoot(container);
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Docopilot />
  </ThemeProvider>
);
