import { useMemo, useState, type ComponentType } from "react";
import {
  AlertTriangle,
  Bug,
  CreditCard,
  LifeBuoy,
  LockKeyhole,
  Send,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { usePost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";

type SupportReportType =
  | "technical_issue"
  | "bug_report"
  | "billing"
  | "account_access"
  | "incident"
  | "feature_request"
  | "other";

type SupportPriority = "low" | "normal" | "high" | "urgent";
type PlanTier = "standard" | "pro" | "all-in";

interface CreateSupportReportPayload {
  type: SupportReportType;
  subject: string;
  message: string;
  salonId?: string;
  pageUrl?: string;
  includeDiagnostics?: boolean;
  diagnostics?: Record<string, unknown>;
}

interface CreateSupportReportResponse {
  ticketId: string;
  priority: SupportPriority;
  planTier: string;
  emailSent: boolean;
  storagePath: string;
}

const reportTypeOptions: Array<{
  value: SupportReportType;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    value: "technical_issue",
    icon: Wrench,
  },
  {
    value: "bug_report",
    icon: Bug,
  },
  {
    value: "billing",
    icon: CreditCard,
  },
  {
    value: "account_access",
    icon: LockKeyhole,
  },
  {
    value: "incident",
    icon: AlertTriangle,
  },
  {
    value: "feature_request",
    icon: Sparkles,
  },
  {
    value: "other",
    icon: LifeBuoy,
  },
];

function resolvePlanTier(raw?: string): PlanTier {
  const normalized = String(raw || "").toLowerCase();
  if (normalized === "pro") return "pro";
  if (normalized === "all-in" || normalized === "all_in" || normalized === "allin") {
    return "all-in";
  }
  return "standard";
}

function computePriority(
  planTier: PlanTier,
  type: SupportReportType,
): SupportPriority {
  const typeScore: Record<SupportReportType, number> = {
    incident: 3,
    technical_issue: 2,
    bug_report: 2,
    billing: 2,
    account_access: 1,
    feature_request: 0,
    other: 0,
  };

  const planBoost: Record<PlanTier, number> = {
    standard: 0,
    pro: 1,
    "all-in": 2,
  };

  const score = typeScore[type] + planBoost[planTier];
  if (score >= 5) return "urgent";
  if (score >= 3) return "high";
  if (score >= 2) return "normal";
  return "low";
}

const priorityStyles: Record<SupportPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

const planStyles: Record<PlanTier, string> = {
  standard: "bg-accent-pink-100 text-accent-pink-500",
  pro: "bg-accent-blue-100 text-accent-blue-500",
  "all-in": "bg-emerald-100 text-emerald-700",
};

export default function SupportReportPage() {
  const { t } = useTranslation();
  const { user, salon } = useUser();
  const planTier = resolvePlanTier(salon?.planTier);

  const [type, setType] = useState<SupportReportType>("technical_issue");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [lastTicket, setLastTicket] = useState<string | null>(null);

  const localizedTypeOptions = useMemo(
    () =>
      reportTypeOptions.map((option) => ({
        ...option,
        label: t(`supportReport.types.${option.value}.label`),
        description: t(`supportReport.types.${option.value}.description`),
      })),
    [t],
  );
  const typeOption = useMemo(
    () => localizedTypeOptions.find((option) => option.value === type),
    [localizedTypeOptions, type],
  );
  const predictedPriority = useMemo(
    () => computePriority(planTier, type),
    [planTier, type],
  );
  const normalizedPlanKey = planTier === "all-in" ? "allIn" : planTier;

  const submitReport = usePost<
    CreateSupportReportResponse,
    CreateSupportReportPayload
  >("support-reports", {
    method: "POST",
    onSuccess: (response) => {
      setLastTicket(response.ticketId);
      setSubject("");
      setMessage("");
      toast.success(t("supportReport.toasts.success", { ticketId: response.ticketId }));
    },
    onError: (error) => {
      toast.error(error.message || t("supportReport.toasts.error"));
    },
  });

  const handleSubmit = () => {
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedSubject.length < 4) {
      toast.error(t("supportReport.validation.subjectMin"));
      return;
    }
    if (trimmedMessage.length < 20) {
      toast.error(t("supportReport.validation.messageMin"));
      return;
    }

    submitReport.mutate({
      type,
      subject: trimmedSubject,
      message: trimmedMessage,
      salonId: salon?.id,
      pageUrl: window.location.href,
      includeDiagnostics,
      diagnostics: includeDiagnostics
        ? {
            browserLanguage: navigator.language,
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            appUserRole: user?.role ?? null,
            appPlanTier: planTier,
          }
        : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("supportReport.title")}
        description={t("supportReport.description")}
      />

      <Card className="border-accent-pink-200/70 bg-linear-to-r from-accent-pink-50 via-background to-accent-blue-50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("supportReport.routing.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">
              {t("supportReport.routing.currentOffer")}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${planStyles[planTier]}`}>
              {t(`supportReport.planTier.${normalizedPlanKey}`)}
            </span>
            <span className="text-muted-foreground">
              {t("supportReport.routing.predictedPriority")}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${priorityStyles[predictedPriority]}`}>
              {t(`supportReport.priorities.${predictedPriority}`)}
            </span>
          </div>
          <p className="text-muted-foreground">
            {t("supportReport.routing.description", {
              email: "support@beautiq-app.com",
            })}
          </p>
          {lastTicket ? (
            <p className="text-accent-pink-500 font-medium">
              {t("supportReport.routing.lastTicket", { ticketId: lastTicket })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("supportReport.form.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>{t("supportReport.form.typeLabel")}</Label>
            <Select value={type} onValueChange={(value) => setType(value as SupportReportType)}>
              <SelectTrigger>
                <SelectValue placeholder={t("supportReport.form.typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {localizedTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {typeOption ? (
              <p className="text-xs text-muted-foreground">{typeOption.description}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>{t("supportReport.form.subjectLabel")}</Label>
            <Input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder={t("supportReport.form.subjectPlaceholder")}
              maxLength={140}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("supportReport.form.messageLabel")}</Label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t("supportReport.form.messagePlaceholder")}
              className="min-h-36"
              maxLength={4000}
            />
            <p className="text-xs text-muted-foreground">
              {t("supportReport.form.messageCount", { count: message.length })}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">
                {t("supportReport.form.includeDiagnosticsLabel")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("supportReport.form.includeDiagnosticsDescription")}
              </p>
            </div>
            <Switch
              checked={includeDiagnostics}
              onCheckedChange={setIncludeDiagnostics}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={submitReport.isPending}
              className="min-w-42"
            >
              <Send className="h-4 w-4" />
              {submitReport.isPending
                ? t("supportReport.form.sending")
                : t("supportReport.form.submit")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
