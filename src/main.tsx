import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AuthProvider } from '@/contexts/AuthProvider';
import { GlobalProvider } from '@/contexts/GlobalProvider';
import { ModalsProvider } from '@/contexts/ModalsProvider';
import { QueryProvider } from '@/contexts/QueryProvider';

import '@/i18n';
import '@/index.css';

import App from '@/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <GlobalProvider>
          <ModalsProvider>
            <App />
          </ModalsProvider>
        </GlobalProvider>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>
);
