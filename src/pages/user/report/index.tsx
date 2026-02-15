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
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    value: "technical_issue",
    label: "Technical issue",
    description: "App behavior, performance, or sync issues.",
    icon: Wrench,
  },
  {
    value: "bug_report",
    label: "Bug report",
    description: "Unexpected error or broken flow.",
    icon: Bug,
  },
  {
    value: "billing",
    label: "Billing",
    description: "Subscription, invoice, or plan questions.",
    icon: CreditCard,
  },
  {
    value: "account_access",
    label: "Account access",
    description: "Login/access/permission issues.",
    icon: LockKeyhole,
  },
  {
    value: "incident",
    label: "Critical incident",
    description: "Urgent service interruption requiring fast response.",
    icon: AlertTriangle,
  },
  {
    value: "feature_request",
    label: "Feature request",
    description: "Suggest a product improvement.",
    icon: Sparkles,
  },
  {
    value: "other",
    label: "Other",
    description: "Any other support topic.",
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
  const { user, salon } = useUser();
  const planTier = resolvePlanTier(salon?.planTier);

  const [type, setType] = useState<SupportReportType>("technical_issue");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [lastTicket, setLastTicket] = useState<string | null>(null);

  const typeOption = useMemo(
    () => reportTypeOptions.find((option) => option.value === type),
    [type],
  );
  const predictedPriority = useMemo(
    () => computePriority(planTier, type),
    [planTier, type],
  );

  const submitReport = usePost<
    CreateSupportReportResponse,
    CreateSupportReportPayload
  >("support-reports", {
    method: "POST",
    onSuccess: (response) => {
      setLastTicket(response.ticketId);
      setSubject("");
      setMessage("");
      toast.success(`Report sent - Ticket ${response.ticketId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit report");
    },
  });

  const handleSubmit = () => {
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedSubject.length < 4) {
      toast.error("Subject must contain at least 4 characters");
      return;
    }
    if (trimmedMessage.length < 20) {
      toast.error("Message must contain at least 20 characters");
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
        title="Support Report"
        description="Send a structured support request directly to Beautiq support."
      />

      <Card className="border-accent-pink-200/70 bg-linear-to-r from-accent-pink-50 via-background to-accent-blue-50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Routing and Priority</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Current offer:</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${planStyles[planTier]}`}>
              {planTier}
            </span>
            <span className="text-muted-foreground">Predicted priority:</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${priorityStyles[predictedPriority]}`}>
              {predictedPriority}
            </span>
          </div>
          <p className="text-muted-foreground">
            Reports are sent to <span className="font-medium text-foreground">support@beautiq-app.com</span> and
            classified with a plan badge plus priority.
          </p>
          {lastTicket ? (
            <p className="text-accent-pink-500 font-medium">
              Last submitted ticket: {lastTicket}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Report type</Label>
            <Select value={type} onValueChange={(value) => setType(value as SupportReportType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypeOptions.map((option) => (
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
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Short summary of your issue"
              maxLength={140}
            />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe what happened, steps to reproduce, and expected result"
              className="min-h-36"
              maxLength={4000}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/4000
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Include diagnostics</p>
              <p className="text-xs text-muted-foreground">
                Browser/user context helps support reproduce the issue faster.
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
              {submitReport.isPending ? "Sending..." : "Send report"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
