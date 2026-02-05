import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "@/contexts/AuthProvider";
import { GlobalProvider } from "@/contexts/GlobalProvider";
import { ModalsProvider } from "@/contexts/ModalsProvider";
import { QueryProvider } from "@/contexts/QueryProvider";
import { ViewModeProvider } from "@/contexts/ViewModeProvider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/sonner";

import { initI18n } from "@/i18n";
import "@/index.css";

import App from "@/App";

const bootstrap = async () => {
  await initI18n();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <AuthProvider>
            <ViewModeProvider>
              <GlobalProvider>
                <ModalsProvider>
                  <App />
                  <Toaster />
                </ModalsProvider>
              </GlobalProvider>
            </ViewModeProvider>
          </AuthProvider>
        </QueryProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
};

void bootstrap();
