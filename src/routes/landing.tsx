import {
  ArrowRight,
  CalendarCheck2,
  Check,
  CircleHelp,
  LineChart,
  Megaphone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import { CONTACT_INFO } from "@/constants/auth";
import { ROUTES } from "@/constants/navigation";
import { Button } from "@/components/ui/button";

const heroStats = [
  { value: "+18%", label: "ventes moyennes" },
  { value: "40h", label: "economisees / mois" },
  { value: "x1.6", label: "taux de retour client" },
];

const features = [
  {
    icon: Users,
    title: "CRM clients",
    description:
      "Centralisez les fiches clients, preferences et historique de ventes dans un espace unique.",
  },
  {
    icon: CalendarCheck2,
    title: "Agenda intelligent",
    description:
      "Organisez vos rendez-vous, reduisez les oublis et suivez la charge de votre equipe en temps reel.",
  },
  {
    icon: ShoppingBag,
    title: "Stock & produits",
    description:
      "Controlez les niveaux de stock avec alertes automatiques pour eviter les ruptures.",
  },
  {
    icon: WalletCards,
    title: "Caisse integree",
    description:
      "Facturez rapidement, suivez les paiements et gardez une trace claire de chaque transaction.",
  },
  {
    icon: Megaphone,
    title: "Marketing automatise",
    description:
      "Lancez des rappels et campagnes sans effort pour faire revenir vos clients.",
  },
  {
    icon: LineChart,
    title: "Pilotage business",
    description:
      "Visualisez vos indicateurs clefs en un coup d'oeil pour prendre les bonnes decisions.",
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
      "5 seats pour l'application mobile",
      "Mise en place rapide",
      "Support de demarrage",
    ],
  },
  {
    name: "Pro",
    price: "150 000 DA",
    subtitle: "Par offre",
    highlighted: true,
    items: [
      "Tout Standard +",
      "Automatisations marketing avancees (SMS, campagnes, rappels)",
      "Tableau analytique avance (CA, retention, performance equipe)",
      "Roles et permissions avances pour l'equipe",
      "Support prioritaire et accompagnement personnalise",
    ],
  },
  {
    name: "All-In",
    price: "500 000 DA",
    subtitle: "Projet complet",
    highlighted: false,
    items: [
      "SaaS installe dans le salon",
      "Deploiement en intranet",
      "Support complet et suivi technique",
      "Accompagnement personnalise",
    ],
  },
];

const faqItems = [
  {
    question: "Combien de temps pour demarrer ?",
    answer:
      "La mise en place initiale est rapide. Une fois votre offre validee, nous configurons votre espace et vous pouvez commencer sans attente.",
  },
  {
    question: "Puis-je faire evoluer mon offre plus tard ?",
    answer:
      "Oui. Vous pouvez passer vers une offre superieure a tout moment selon la croissance de votre salon.",
  },
  {
    question: "Le support est-il inclus ?",
    answer:
      "Oui. Chaque offre inclut un niveau de support. L'offre All-In inclut un accompagnement complet et continu.",
  },
  {
    question: "Comment acceder a mon espace ?",
    answer:
      "Vous pouvez acceder a l'application via le bouton Connexion en haut de page.",
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
              Fonctionnalites
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
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
            <p className="inline-flex items-center gap-2 rounded-full border border-accent-pink-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-accent-pink-500 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Solution tout-en-un pour salons & instituts
            </p>

            <div className="space-y-5">
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Pilotez votre salon en un seul endroit.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                De la prise de rendez-vous au paiement, Beautiq centralise CRM,
                agenda, ventes et marketing pour vous faire gagner du temps et
                developper votre chiffre.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to={ROUTES.LOGIN}>
                  Acceder a mon espace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-accent-blue-200 bg-white/80 sm:w-auto"
              >
                <a href="#features">Voir les fonctionnalites</a>
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
                { title: "Marketing", meta: "68% ouverture campagne", tone: "blue" },
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
                Tout est synchronise
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vos donnees, votre equipe et vos clients restent alignes sur web
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
                Gestion manuelle et dispersee
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span>-</span> Rendez-vous perdus ou doubles
                </li>
                <li className="flex gap-2">
                  <span>-</span> Fiches clients incompletes
                </li>
                <li className="flex gap-2">
                  <span>-</span> Ruptures de stock frequentes
                </li>
              </ul>
            </article>

            <article className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5">
              <p className="text-xs uppercase tracking-wide text-emerald-600">
                Apres
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Une operation unifiee dans Beautiq
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Agenda intelligent avec rappels
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  CRM centralise et historique complet
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Stock, ventes et marketing connectes
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-pink-500">
              Fonctionnalites
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Tout ce qu'il faut pour presenter et faire tourner votre activite
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
              Offres adaptees a votre niveau de croissance
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
                    Recommande
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
                  <Link to={ROUTES.LOGIN}>Demarrer</Link>
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
              <h2 className="mt-4 text-3xl font-semibold">Questions frequentes</h2>
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
                  Pret a passer a l'action
                </p>
                <h2 className="text-3xl font-semibold sm:text-4xl">
                  Presentez vos offres et connectez vos equipes rapidement.
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
                  <a href={`tel:${CONTACT_INFO.PHONE.replace(/\s/g, "")}`}>
                    Parler a un conseiller
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>(c) 2026 Beautiq. Tous droits reserves.</p>
          <p>CRM, agenda, ventes et marketing pour salons.</p>
        </div>
      </footer>
    </div>
  );
}
