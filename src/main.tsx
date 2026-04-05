import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "@/contexts/AuthProvider";
import { ModalsProvider } from "@/contexts/ModalsProvider";
import { QueryProvider } from "@/contexts/QueryProvider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/sonner";
import { SlaWelcomeModal } from "@/components/sla-welcome-modal";

import { initI18n } from "@/i18n";
import "@/index.css";
import { initPwa } from "@/pwa";

import App from "@/App";

const bootstrap = async () => {
  await initI18n();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <AuthProvider>
            <SlaWelcomeModal />
            <ModalsProvider>
              <App />
              <Toaster />
            </ModalsProvider>
          </AuthProvider>
        </QueryProvider>
      </ErrorBoundary>
    </StrictMode>,
  );

  initPwa();
};

void bootstrap();
