/*
    Cost Manager Front End
    Final Project in Front-End Development

    main.jsx - the entry point of the application. This module creates the
    root of the React application and renders the App component into the
    element the index.html document includes.
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App.jsx';

// the theme the MUI components of this application work with
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#1976d2' },
        secondary: { main: '#e53935' },
        background: { default: '#f4f6f8' }
    },
    shape: { borderRadius: 10 },
    typography: {
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);
