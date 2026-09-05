import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { AuthProvider } from './hooks/use-auth-store';
import { Toaster } from './components/ui/toaster';
import { LocaleProvider } from './components/providers/LocaleProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* LocaleProvider wraps everything — detects IP locale before first render */}
    <LocaleProvider>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </LocaleProvider>
  </React.StrictMode>
);
