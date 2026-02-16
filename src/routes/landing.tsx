import {
  ArrowRight,
  CalendarCheck2,
  Check,
  CircleHelp,
  LineChart,
  Megaphone,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import { CONTACT_INFO } from "@/constants/auth";
import { ROUTES } from "@/constants/navigation";
import { Button } from "@/components/ui/button";

const heroStats = [
  { value: "+18%", label: "ventes en salon de beauté" },
  { value: "40h", label: "gagnées / mois par équipe" },
  { value: "x1.6", label: "retour client en esthétique" },
];

const features = [
  {
    icon: Users,
    title: "CRM clients",
    description:
      "Centralisez les fiches clients, préférences et historique de ventes dans un espace unique.",
  },
  {
    icon: CalendarCheck2,
    title: "Agenda intelligent",
    description:
      "Organisez vos rendez-vous, réduisez les oublis et suivez la charge de votre équipe en temps réel.",
  },
  {
    icon: ShoppingBag,
    title: "Stock & produits",
    description:
      "Contrôlez les niveaux de stock avec alertes automatiques pour éviter les ruptures.",
  },
  {
    icon: WalletCards,
    title: "Caisse intégrée",
    description:
      "Facturez rapidement, suivez les paiements et gardez une trace claire de chaque transaction.",
  },
  {
    icon: Megaphone,
    title: "Marketing automatisé",
    description:
      "Lancez des rappels et campagnes sans effort pour faire revenir vos clients.",
  },
  {
    icon: LineChart,
    title: "Pilotage business",
    description:
      "Visualisez vos indicateurs clés en un coup d'œil pour prendre les bonnes décisions.",
  },
];

const planCards = [
  {
    name: "Standard",
    price: "100 000 DA",
    subtitle: "Par offre",
    highlighted: false,
    items: [
      "Admin user inclus",
      "5 sièges pour l'application mobile",
      "Mise en place rapide",
      "Support de démarrage",
    ],
  },
  {
    name: "Pro",
    price: "150 000 DA",
    subtitle: "Par offre",
    highlighted: true,
    items: [
      "Tout Standard +",
      "Automatisations marketing avancées (SMS, campagnes, rappels)",
      "Tableau analytique avancé (CA, rétention, performance équipe)",
      "Rôles et permissions avancés pour l'équipe",
      "Support prioritaire et accompagnement personnalisé",
    ],
  },
  {
    name: "All-In",
    price: "500 000 DA",
    subtitle: "Projet complet",
    highlighted: false,
    items: [
      "SaaS installé dans le salon",
      "Déploiement en intranet",
      "Support complet et suivi technique",
      "Accompagnement personnalisé",
    ],
  },
];

const faqItems = [
  {
    question: "Combien de temps pour démarrer ?",
    answer:
      "La mise en place initiale est rapide. Une fois votre offre validée, nous configurons votre espace et vous pouvez commencer sans attente.",
  },
  {
    question: "Puis-je faire évoluer mon offre plus tard ?",
    answer:
      "Oui. Vous pouvez passer vers une offre supérieure à tout moment selon la croissance de votre salon.",
  },
  {
    question: "Le support est-il inclus ?",
    answer:
      "Oui. Chaque offre inclut un niveau de support. L'offre All-In inclut un accompagnement complet et continu.",
  },
  {
    question: "Comment accéder à mon espace ?",
    answer:
      "Vous pouvez accéder à l'application via le bouton Connexion en haut de page.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-accent-pink-50 via-background to-accent-blue-50 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-36 left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-accent-pink-200/55 blur-3xl animate-float-slow" />
        <div className="absolute right-[-8rem] top-[12rem] h-[30rem] w-[30rem] rounded-full bg-accent-blue-200/45 blur-3xl animate-float-slower" />
        <div className="absolute inset-0 bg-brand-grid opacity-45" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="#top"
            className="inline-flex items-center gap-3 text-foreground transition-transform duration-300 hover:scale-[1.01]"
          >
            <img
              src="/branding/beautiq-logo.svg"
              alt="Beautiq"
              className="h-10 w-10 rounded-2xl object-contain"
              decoding="async"
            />
            <span className="text-lg font-semibold tracking-tight">Beautiq</span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <Link to={ROUTES.MOBILE_APP}>
                <Smartphone className="h-4 w-4" />
                App mobile
              </Link>
            </Button>
            <Button asChild size="sm" className="shadow-lg shadow-accent-pink-300/40">
              <Link to={ROUTES.LOGIN}>
                Se connecter
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="top" className="relative z-10">
        <section className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-24">
          <div className="space-y-8 animate-fade-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-4 rounded-2xl border border-accent-pink-200 bg-white/85 px-4 py-3 shadow-sm">
                <svg
                  viewBox="0 0 120 80"
                  role="img"
                  aria-label="Drapeau algérien"
                  className="h-12 w-20 overflow-hidden rounded-md border border-black/5 shadow-sm sm:h-14 sm:w-24"
                >
                  <rect width="120" height="80" fill="#fff" />
                  <rect width="60" height="80" fill="#006233" />
                  <circle cx="66" cy="40" r="21" fill="#d21034" />
                  <circle cx="71" cy="40" r="17" fill="#fff" />
                  <polygon
                    points="84,29 87,37 95,37 89,42 92,50 84,45 76,50 79,42 73,37 81,37"
                    fill="#d21034"
                  />
                </svg>
                <p className="text-sm font-semibold uppercase tracking-wide text-accent-pink-500 sm:text-base">
                  100% Algérien
                </p>
              </div>
            </div>
            <div className="space-y-5">
              <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                <span className="block bg-linear-to-r from-accent-pink-500 via-accent-pink-400 to-accent-blue-500 bg-clip-text text-transparent">
                  Logiciel 100% Algérien pour salons de beauté
                </span>
                <span className="mt-1 block bg-linear-to-r from-accent-pink-500 via-accent-pink-400 to-accent-blue-500 bg-clip-text text-[0.7em] text-transparent">
                  Onglerie, esthétique, spa.
                </span>
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                De la prise de rendez-vous au paiement, Beautiq centralise CRM,
                agenda, ventes et marketing pour vous faire gagner du temps et
                développer votre chiffre.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to={ROUTES.LOGIN}>
                  Accéder à mon espace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-accent-pink-200 bg-white/80 sm:w-auto"
              >
                <Link to={ROUTES.MOBILE_APP}>
                  <Smartphone className="h-4 w-4" />
                  Telecharger l'app mobile
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-accent-blue-200 bg-white/80 sm:w-auto"
              >
                <a href="#features">Voir les fonctionnalités</a>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-lg shadow-accent-blue-100/40 animate-fade-up"
                  style={{ animationDelay: `${100 + index * 90}ms` }}
                >
                  <p className="text-2xl font-semibold tracking-tight text-accent-pink-500">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative rounded-3xl border border-white/80 bg-white/90 p-5 shadow-2xl shadow-accent-blue-200/45 animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-linear-to-r from-accent-pink-50 to-accent-blue-50 px-4 py-3">
              <div>
                <p className="text-sm text-muted-foreground">Tableau de bord</p>
                <p className="text-lg font-semibold">Vue salon en direct</p>
              </div>
              <span className="rounded-full bg-accent-pink-500 px-3 py-1 text-xs font-semibold text-white">
                En ligne
              </span>
            </div>

            <div className="space-y-3">
              {[
                { title: "CRM", meta: "247 clients actifs", tone: "pink" },
                { title: "Agenda", meta: "12 RDV aujourd'hui", tone: "blue" },
                { title: "Ventes", meta: "2 340 000 DA ce mois", tone: "pink" },
                { title: "Marketing", meta: "68% d'ouverture campagne", tone: "blue" },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-white p-3 transition-transform duration-300 hover:-translate-y-0.5"
                  style={{ animationDelay: `${260 + index * 70}ms` }}
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.meta}</p>
                  </div>
                  <div
                    className={
                      item.tone === "pink"
                        ? "h-2.5 w-2.5 rounded-full bg-accent-pink-500"
                        : "h-2.5 w-2.5 rounded-full bg-accent-blue-500"
                    }
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-accent-pink-100 bg-accent-pink-50/80 p-4">
              <p className="text-sm font-medium text-accent-pink-500">
                Tout est synchronisé
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vos données, votre équipe et vos clients restent alignés sur web
                et mobile.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-accent-blue-100/35 md:grid-cols-2">
            <article className="rounded-2xl border border-red-100 bg-red-50/70 p-5">
              <p className="text-xs uppercase tracking-wide text-red-500">
                Avant
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Gestion manuelle et dispersée
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span>-</span> Rendez-vous perdus ou doublés
                </li>
                <li className="flex gap-2">
                  <span>-</span> Fiches clients incomplètes
                </li>
                <li className="flex gap-2">
                  <span>-</span> Ruptures de stock fréquentes
                </li>
              </ul>
            </article>

            <article className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5">
              <p className="text-xs uppercase tracking-wide text-emerald-600">
                Après
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Une opération unifiée dans Beautiq
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Agenda intelligent avec rappels
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  CRM centralisé et historique complet
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Stock, ventes et marketing connectés
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-pink-500">
              Fonctionnalités
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Tout ce qu'il faut pour présenter et faire tourner votre activité
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-white/75 bg-white/85 p-5 shadow-lg shadow-accent-blue-100/35 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-up"
                  style={{ animationDelay: `${120 + index * 70}ms` }}
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-accent-pink-100 to-accent-blue-100 text-accent-pink-500 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-7xl px-4 pb-18 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-blue-500">
              Tarifs
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Offres adaptées à votre niveau de croissance
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {planCards.map((plan, index) => (
              <article
                key={plan.name}
                className={
                  plan.highlighted
                    ? "relative rounded-3xl border border-accent-pink-300 bg-white p-6 shadow-2xl shadow-accent-pink-200/50 animate-fade-up"
                    : "relative rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-accent-blue-100/40 animate-fade-up"
                }
                style={{ animationDelay: `${80 + index * 90}ms` }}
              >
                {plan.highlighted ? (
                  <span className="absolute right-5 top-5 rounded-full bg-accent-pink-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Recommandé
                  </span>
                ) : null}

                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  {plan.name}
                </p>
                <p className="mt-3 text-4xl font-semibold text-accent-pink-500">
                  {plan.price}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.subtitle}</p>

                <ul className="mt-6 space-y-3">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink-500" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  className={
                    plan.highlighted
                      ? "mt-6 w-full"
                      : "mt-6 w-full border-accent-pink-200 bg-accent-pink-50 hover:bg-accent-pink-100"
                  }
                >
                  <Link to={ROUTES.LOGIN}>Démarrer</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl shadow-accent-blue-100/35 sm:p-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-accent-blue-200 bg-accent-blue-50 px-3 py-1 text-sm font-medium text-accent-blue-500">
                <CircleHelp className="h-4 w-4" />
                FAQ
              </p>
              <h2 className="mt-4 text-3xl font-semibold">Questions fréquentes</h2>
            </div>

            <div className="mx-auto mt-8 max-w-4xl space-y-3">
              {faqItems.map((item, index) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-border/70 bg-white p-4 animate-fade-up"
                  style={{ animationDelay: `${90 + index * 80}ms` }}
                >
                  <summary className="cursor-pointer list-none font-medium text-foreground">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-18 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-accent-pink-200 bg-linear-to-r from-accent-pink-500 to-accent-blue-500 p-8 text-white shadow-2xl shadow-accent-pink-300/45 sm:p-10 animate-gradient-flow">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs uppercase tracking-wide">
                  <ShieldCheck className="h-4 w-4" />
                  Prêt à passer à l'action
                </p>
                <h2 className="text-3xl font-semibold sm:text-4xl">
                  Présentez vos offres et connectez vos équipes rapidement.
                </h2>
                <p className="max-w-2xl text-white/90">
                  Contact: {CONTACT_INFO.PHONE} - support@beautiq-app.com
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-accent-pink-500 hover:bg-white/90"
                >
                  <Link to={ROUTES.LOGIN}>
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/60 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link to={ROUTES.MOBILE_APP}>
                    <Smartphone className="h-4 w-4" />
                    Telecharger l'app mobile
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/60 bg-white/10 text-white hover:bg-white/20"
                >
                  <a href={`tel:${CONTACT_INFO.PHONE.replace(/\s/g, "")}`}>
                    Parler à un conseiller
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-accent-pink-200 bg-white/90 p-6 text-center shadow-xl shadow-accent-pink-100/40 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-blue-600">
              Identité algérienne
            </p>
            <p className="mt-3 text-balance text-2xl font-semibold leading-tight text-accent-pink-500 sm:text-3xl">
              Première application DZ de gestion pour salons de beauté et instituts
              esthétiques en Algérie.
            </p>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Digitalisez votre salon en un clic.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>(c) 2026 Beautiq. Tous droits réservés.</p>
          <p>CRM, agenda, ventes et marketing pour salons.</p>
        </div>
      </footer>
    </div>
  );
}
