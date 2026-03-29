import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/navigation";

const EFFECTIVE_DATE = "21 fevrier 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-accent-pink-50 via-background to-accent-blue-50 text-foreground">
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-pink-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-pink-500">
            <FileText className="h-4 w-4" />
            Conditions d'utilisation
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Conditions generales d'utilisation (CGU)
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Date d'entree en vigueur: {EFFECTIVE_DATE}
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
            <h2 className="text-xl font-semibold">1. Objet</h2>
            <p className="text-sm text-muted-foreground">
              Beautiq fournit une plateforme SaaS de gestion pour salons de
              beaute: CRM, agenda, ventes et outils d'exploitation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2. Acces au service</h2>
            <p className="text-sm text-muted-foreground">
              L'acces necessite un compte autorise. L'utilisateur est
              responsable de la confidentialite de ses identifiants et des
              actions realisees depuis son compte.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3. Utilisation acceptable</h2>
            <p className="text-sm text-muted-foreground">
              Il est interdit d'utiliser la plateforme pour des activites
              illegales, frauduleuses, abusives, ou portant atteinte aux droits
              de tiers. Beautiq peut suspendre un compte en cas de non-respect.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">
              4. Donnees et responsabilite
            </h2>
            <p className="text-sm text-muted-foreground">
              Les donnees saisies restent sous la responsabilite du salon.
              Beautiq met en oeuvre des mesures de securite raisonnables mais ne
              garantit pas une disponibilite ininterrompue du service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">
              5. Facturation et abonnement
            </h2>
            <p className="text-sm text-muted-foreground">
              Beautiq propose une offre unique avec toutes les fonctionnalites
              avancees incluses. Les evolutions tarifaires sont communiquees
              avant application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">6. Services tiers</h2>
            <p className="text-sm text-muted-foreground">
              Certaines fonctionnalites s'appuient sur des services tiers comme
              WhatsApp, SMS ou email. Leur disponibilite et leurs politiques
              restent sous la responsabilite de ces fournisseurs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">7. Contact</h2>
            <p className="text-sm text-muted-foreground">
              Pour toute question juridique: support@beautiq-app.com
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
}
