import { ArrowRight, Check, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { CONTACT_INFO } from "@/constants/auth";
import { ROUTES } from "@/constants/navigation";
import { Button } from "@/components/ui/button";

const highlightValues = [
  { key: "growth", value: "+17,3 points" },
  { key: "cost", value: "-20%" },
  { key: "dz", value: "100% DZ" },
] as const;

export default function LandingPage() {
  const { t } = useTranslation();

  const navLeft = [
    { label: t("landing.nav.discover"), href: "#top" },
    { label: t("landing.nav.services"), href: "#features" },
    { label: t("landing.nav.pricing"), href: "#pricing" },
  ];

  const navRight = [
    { label: t("landing.nav.algeria"), href: "#algeria" },
    { label: t("landing.nav.mobile"), href: "#mobile" },
    { label: t("landing.nav.contact"), href: "#contact" },
  ];

  const offerCard = {
    name: t("landing.plans.pro.name"),
    subtitle: t("landing.plans.pro.subtitle"),
    items: [
      t("landing.plans.pro.item1"),
      t("landing.plans.pro.item2"),
      t("landing.plans.pro.item3"),
      t("landing.plans.pro.item4"),
      t("landing.plans.pro.item5"),
      t("landing.plans.pro.item6"),
    ],
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-accent-pink-100 via-accent-blue-50 to-accent-pink-100 text-foreground">
      <header className="border-b border-accent-pink-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-6 lg:gap-10">
            <a
              href="#top"
              className="inline-flex items-center gap-3 text-accent-pink-700 transition-transform hover:scale-[1.01]"
            >
              <img
                src="/branding/beautiq-logo.svg"
                alt="Beautiq"
                className="h-10 w-10 rounded-xl object-contain"
                decoding="async"
              />
              <span
                className="text-3xl leading-none"
                style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
              >
                Beautiq
              </span>
            </a>

            <nav className="hidden items-center gap-8 text-sm text-accent-pink-700 lg:flex">
              {navLeft.map((item) => (
                <a key={item.label} href={item.href} className="hover:text-accent-pink-500 transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-8 text-sm text-accent-pink-700 xl:flex">
              {navRight.map((item) => (
                <a key={item.label} href={item.href} className="hover:text-accent-pink-500 transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
            <Button asChild size="sm" variant="outline" className="hidden border-accent-pink-200 sm:inline-flex">
              <Link id="mobile" to={ROUTES.MOBILE_APP}>
                <Smartphone className="h-4 w-4" />
                {t("landing.ctaMobile")}
              </Link>
            </Button>
            <Button asChild size="sm" className="min-w-28">
              <Link to={ROUTES.LOGIN}>
                {t("landing.nav.login")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section id="top" className="px-4 pb-12 pt-10 sm:px-6 lg:px-10 lg:pt-14">
          <div className="mx-auto max-w-[1600px]">
            <div className="mx-auto max-w-5xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-accent-pink-200 bg-accent-pink-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent-pink-600">
                <ShieldCheck className="h-4 w-4" />
                <svg
                  viewBox="0 0 120 80"
                  role="img"
                  aria-label={t("landing.algeriaFlagLabel")}
                  className="h-4 w-6 overflow-hidden rounded-sm border border-black/10"
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
                {t("landing.badge")}
              </p>
              <h1
                className="mx-auto mt-6 max-w-4xl text-balance text-5xl leading-[0.95] tracking-tight text-accent-pink-700 sm:text-6xl lg:text-8xl"
                style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
              >
                {t("landing.titleLine1")}
                <br />
                {t("landing.titleLine2")}
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg">
                {t("landing.description")}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-w-52">
                  <Link to={ROUTES.LOGIN}>
                    {t("landing.ctaLogin")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="min-w-52 border-accent-pink-200">
                  <Link to={ROUTES.MOBILE_APP}>
                    <Smartphone className="h-4 w-4" />
                    {t("landing.ctaMobile")}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-[1280px] overflow-hidden rounded-[1.75rem] border border-accent-pink-200/80 bg-accent-pink-50/50">
              <img
                src="/branding/hero-salon-photo.jpg"
                alt={t("landing.heroImageAlt")}
                className="h-[56vh] min-h-[360px] w-full object-cover object-center"
                decoding="async"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {highlightValues.map((item) => (
                <article
                  key={item.key}
                  className="rounded-2xl border border-accent-blue-200/70 bg-accent-blue-50/40 px-4 py-4 text-left"
                >
                  <p className="text-xl font-semibold text-accent-pink-600">{item.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`landing.highlights.${item.key}Label`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-14 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1600px]">
            <div className="rounded-3xl border border-accent-blue-200/70 bg-accent-blue-50/45 p-6 sm:p-8">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-blue-600">
                <Sparkles className="h-4 w-4" />
                {t("landing.features.badge")}
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-white/80 bg-white/90 p-4">
                  <p className="font-semibold">{t("landing.features.crmTitle")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("landing.features.crmDescription")}</p>
                </article>
                <article className="rounded-2xl border border-white/80 bg-white/90 p-4">
                  <p className="font-semibold">{t("landing.features.agendaTitle")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("landing.features.agendaDescription")}</p>
                </article>
                <article className="rounded-2xl border border-white/80 bg-white/90 p-4">
                  <p className="font-semibold">{t("landing.features.cashTitle")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("landing.features.cashDescription")}</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 pb-12 pt-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1600px]">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-blue-600">
                {t("landing.pricing.badge")}
              </p>
              <h2
                className="mt-3 text-4xl text-accent-pink-700 sm:text-5xl"
                style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
              >
                {t("landing.pricing.title")}
              </h2>
              <p className="mt-4 inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900">
                {t("landing.pricing.launchNote")}
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-4xl">
              <article className="rounded-3xl border border-accent-pink-300 bg-white p-6 shadow-2xl shadow-accent-pink-200/50">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  {offerCard.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {offerCard.subtitle}
                </p>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {offerCard.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink-500" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild className="mt-6 w-full">
                  <Link to={ROUTES.LOGIN}>{t("landing.pricing.start")}</Link>
                </Button>
              </article>
            </div>
          </div>
        </section>

        <section id="algeria" className="px-4 pb-12 pt-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1600px] rounded-3xl border border-accent-pink-200 bg-linear-to-r from-accent-pink-50 via-white to-accent-blue-50 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-blue-600">
              {t("landing.algeria.badge")}
            </p>
            <h3
              className="mt-2 text-3xl text-accent-pink-700 sm:text-4xl"
              style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
            >
              {t("landing.algeria.title")}
            </h3>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              {t("landing.algeria.description")}
            </p>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              {t("landing.dzPioneer")} {t("landing.digitalizeOneClick")}
            </p>
            <p className="mt-2 text-muted-foreground">
              Contact: {CONTACT_INFO.PHONE} - support@beautiq-app.com
            </p>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-accent-pink-200/80 bg-accent-pink-50/40 px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("landing.footer.rights")}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to={ROUTES.TERMS} className="underline-offset-4 hover:underline">
              {t("landing.footer.terms")}
            </Link>
            <Link to={ROUTES.PRIVACY} className="underline-offset-4 hover:underline">
              {t("landing.footer.privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
