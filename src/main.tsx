import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "@/contexts/AuthProvider";
import { BusinessSummaryProvider } from "@/contexts/BusinessSummaryProvider";
import { CategoriesProvider } from "@/contexts/CategoriesProvider";
import { GlobalProvider } from "@/contexts/GlobalProvider";
import { LoyaltyProvider } from "@/contexts/LoyaltyProvider";
import { ModalsProvider } from "@/contexts/ModalsProvider";
import { QueryProvider } from "@/contexts/QueryProvider";
import { SalonSettingsProvider } from "@/contexts/SalonSettingsProvider";
import { ServicesProvider } from "@/contexts/ServicesProvider";
import { StaffProvider } from "@/contexts/StaffProvider";
import { ViewModeProvider } from "@/contexts/ViewModeProvider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/sonner";
import { SlaWelcomeModal } from "@/components/sla-welcome-modal";
import { PlanExpiryWarningModal } from "@/components/plan-expiry-warning-modal";

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
            <SalonSettingsProvider>
              <StaffProvider>
                <ServicesProvider>
                  <CategoriesProvider>
                    <BusinessSummaryProvider>
                      <LoyaltyProvider>
                        <SlaWelcomeModal />
                        <PlanExpiryWarningModal />
                        <ViewModeProvider>
                          <GlobalProvider>
                            <ModalsProvider>
                              <App />
                              <Toaster />
                            </ModalsProvider>
                          </GlobalProvider>
                        </ViewModeProvider>
                      </LoyaltyProvider>
                    </BusinessSummaryProvider>
                  </CategoriesProvider>
                </ServicesProvider>
              </StaffProvider>
            </SalonSettingsProvider>
          </AuthProvider>
        </QueryProvider>
      </ErrorBoundary>
    </StrictMode>,
  );

  initPwa();
};

void bootstrap();
