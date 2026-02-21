import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/navigation";

const EFFECTIVE_DATE = "21 février 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-accent-pink-50 via-background to-accent-blue-50 text-foreground">
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-blue-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-blue-600">
            <ShieldCheck className="h-4 w-4" />
            Politique de confidentialité
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Politique de confidentialité
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Date d'entrée en vigueur: {EFFECTIVE_DATE}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.HOME}>
              <ArrowLeft className="h-4 w-4" />
              Retour au site
            </Link>
          </Button>
        </header>

        <Card className="space-y-6 p-6">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1. Données collectées</h2>
            <p className="text-sm text-muted-foreground">
              Nous collectons les informations nécessaires au fonctionnement du
              service: identité des utilisateurs, données salon, clients,
              rendez-vous, ventes et paramètres techniques.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2. Finalités</h2>
            <p className="text-sm text-muted-foreground">
              Les données sont utilisées pour fournir la plateforme Beautiq,
              sécuriser les comptes, améliorer le produit et assurer l'assistance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3. Base légale</h2>
            <p className="text-sm text-muted-foreground">
              Le traitement est fondé sur l'exécution du contrat de service, les
              obligations légales applicables et, selon les cas, le consentement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4. Partage des données</h2>
            <p className="text-sm text-muted-foreground">
              Les données ne sont pas vendues. Elles peuvent être partagées avec
              des sous-traitants techniques et des services tiers nécessaires au
              fonctionnement (hébergement, authentification, messagerie, réseaux
              sociaux) dans le strict cadre du service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">5. Sécurité et conservation</h2>
            <p className="text-sm text-muted-foreground">
              Nous appliquons des mesures de sécurité raisonnables. Les données
              sont conservées pendant la durée nécessaire aux finalités du service
              et aux obligations légales.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">6. Vos droits</h2>
            <p className="text-sm text-muted-foreground">
              Vous pouvez demander l'accès, la rectification, la suppression ou la
              limitation du traitement de vos données via support@beautiq-app.com.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">7. Contact</h2>
            <p className="text-sm text-muted-foreground">
              Pour toute demande relative à la confidentialité:
              support@beautiq-app.com
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
}
