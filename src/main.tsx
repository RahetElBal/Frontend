import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AuthProvider } from '@/contexts/AuthProvider';
import { GlobalProvider } from '@/contexts/GlobalProvider';
import { ModalsProvider } from '@/contexts/ModalsProvider';
import { QueryProvider } from '@/contexts/QueryProvider';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';

import '@/i18n';
import '@/index.css';

import App from '@/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <GlobalProvider>
            <ModalsProvider>
              <App />
              <Toaster />
            </ModalsProvider>
          </GlobalProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  </StrictMode>
);
