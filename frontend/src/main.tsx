import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Component App chính
import './styles/globals.css'; // Import global styles
import { AuthProvider } from './hooks/use-auth-store';
import { Toaster } from './components/ui/toaster';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </React.StrictMode>
);
