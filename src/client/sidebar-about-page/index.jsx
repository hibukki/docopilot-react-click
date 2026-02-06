import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Docopilot from './components/Docopilot';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c5282', // warm ink blue
    },
    secondary: {
      main: '#c75c3a', // muted coral / editor's pen
    },
    error: {
      main: '#c75c3a',
      light: '#fef2f0',
      dark: '#5a2318',
      contrastText: '#5a2318',
    },
    background: {
      default: '#faf8f5', // warm off-white, like quality paper
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e', // deep charcoal
      secondary: '#6b7280', // warm gray
    },
    divider: '#e8e4df',
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
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: theme.shadows[1] },
        }),
        outlinedPrimary: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 600,
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: theme.palette.divider },
          },
        }),
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
