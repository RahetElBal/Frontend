import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  CreditCard,
  LifeBuoy,
  LockKeyhole,
  RefreshCcw,
  Send,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { AppRole } from "@/constants/enum";
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
import { useGet } from "@/hooks/useGet";
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
type SupportTicketStatus =
  | "open"
  | "queued"
  | "awaiting_support"
  | "awaiting_user"
  | "closed";

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
  status: SupportTicketStatus;
  emailSent: boolean;
  storagePath: string;
}

interface SupportTicketMessage {
  id: string;
  authorRole: "user" | "support";
  authorName: string;
  content: string;
  createdAt: string;
}

interface SupportTicket {
  ticketId: string;
  createdAt: string;
  updatedAt: string;
  priority: SupportPriority;
  planTier: PlanTier;
  status: SupportTicketStatus;
  type: string;
  subject: string;
  pageUrl: string | null;
  canReply: boolean;
  messages: SupportTicketMessage[];
}

interface AddSupportReplyPayload {
  ticketId: string;
  message: string;
}

interface CloseSupportTicketPayload {
  ticketId: string;
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

const statusStyles: Record<SupportTicketStatus, string> = {
  open: "bg-slate-100 text-slate-700",
  queued: "bg-purple-100 text-purple-700",
  awaiting_support: "bg-amber-100 text-amber-700",
  awaiting_user: "bg-emerald-100 text-emerald-700",
  closed: "bg-zinc-200 text-zinc-700",
};

const SUPPORT_TICKETS_QUERY_KEY = ["support-reports", "mine", {}] as const;

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export default function SupportReportPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, salon } = useUser();
  const planTier = resolvePlanTier(salon?.planTier);
  const supportResponder = Boolean(
    user?.isSuperadmin || user?.role === AppRole.SUPER_ADMIN,
  );

  const [type, setType] = useState<SupportReportType>("technical_issue");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [lastTicket, setLastTicket] = useState<string | null>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

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
  const queryClient = useQueryClient();
  const ticketsQuery = useGet<SupportTicket[]>({
    path: "support-reports/mine",
    options: {
      refetchInterval: 15000,
      staleTime: 5000,
    },
  });

  const tickets = ticketsQuery.data ?? [];

  const readTicketsCache = () =>
    queryClient.getQueryData<SupportTicket[]>(SUPPORT_TICKETS_QUERY_KEY) ?? [];

  const writeTicketsCache = (
    updater: (current: SupportTicket[]) => SupportTicket[],
  ) => {
    queryClient.setQueryData<SupportTicket[]>(
      SUPPORT_TICKETS_QUERY_KEY,
      (existing) => updater(existing ?? []),
    );
  };

  useEffect(() => {
    if (!tickets.length) {
      setActiveTicketId(null);
      return;
    }

    const requestedTicketId = new URLSearchParams(location.search).get("ticketId");
    if (
      requestedTicketId &&
      tickets.some((ticket) => ticket.ticketId === requestedTicketId)
    ) {
      setActiveTicketId(requestedTicketId);
      return;
    }

    if (!activeTicketId || !tickets.some((ticket) => ticket.ticketId === activeTicketId)) {
      setActiveTicketId(tickets[0].ticketId);
    }
  }, [tickets, activeTicketId, location.search]);

  const activeTicket = useMemo(
    () => tickets.find((ticket) => ticket.ticketId === activeTicketId) ?? null,
    [tickets, activeTicketId],
  );

  const sendReply = usePost<SupportTicket, AddSupportReplyPayload>(
    (payload) => `support-reports/${encodeURIComponent(payload.ticketId)}/replies`,
    {
      method: "POST",
      invalidate: ["support-reports"],
      onMutate: (payload) => {
        const previousTickets = readTicketsCache();
        const now = new Date().toISOString();
        const optimisticMessage: SupportTicketMessage = {
          id: `TMP-MSG-${Date.now()}`,
          authorRole: supportResponder ? "support" : "user",
          authorName: supportResponder
            ? t("supportReport.inbox.support", {
                defaultValue: "Beautiq Support",
              })
            : t("supportReport.inbox.you", {
                defaultValue: "You",
              }),
          content: payload.message.trim(),
          createdAt: now,
        };

        writeTicketsCache((current) =>
          current.map((ticket) =>
            ticket.ticketId === payload.ticketId
              ? {
                  ...ticket,
                  updatedAt: now,
                  status: supportResponder ? "awaiting_user" : "awaiting_support",
                  messages: [...ticket.messages, optimisticMessage],
                }
              : ticket,
          ),
        );

        return { previousTickets };
      },
      onSuccess: (ticket) => {
        writeTicketsCache((current) => {
          const exists = current.some((entry) => entry.ticketId === ticket.ticketId);
          if (!exists) return [ticket, ...current];
          return current.map((entry) =>
            entry.ticketId === ticket.ticketId ? ticket : entry,
          );
        });
        setReplyDrafts((prev) => ({ ...prev, [ticket.ticketId]: "" }));
        setActiveTicketId(ticket.ticketId);
        toast.success(
          t("supportReport.toasts.replySent", {
            defaultValue: "Reply sent",
          }),
        );
      },
      onError: (error, _variables, context) => {
        const previousTickets = (
          context as { previousTickets?: SupportTicket[] } | undefined
        )?.previousTickets;
        if (previousTickets) {
          queryClient.setQueryData(SUPPORT_TICKETS_QUERY_KEY, previousTickets);
        }
        toast.error(
          error.message ||
            t("supportReport.toasts.replyError", {
              defaultValue: "Failed to send reply",
            }),
        );
      },
    },
  );

  const closeTicket = usePost<SupportTicket, CloseSupportTicketPayload>(
    (payload) => `support-reports/${encodeURIComponent(payload.ticketId)}/close`,
    {
      method: "POST",
      invalidate: ["support-reports"],
      onMutate: (payload) => {
        const previousTickets = readTicketsCache();
        const now = new Date().toISOString();

        writeTicketsCache((current) =>
          current.map((ticket) =>
            ticket.ticketId === payload.ticketId
              ? {
                  ...ticket,
                  status: "closed",
                  updatedAt: now,
                }
              : ticket,
          ),
        );

        return { previousTickets };
      },
      onSuccess: (ticket) => {
        writeTicketsCache((current) => {
          const exists = current.some((entry) => entry.ticketId === ticket.ticketId);
          if (!exists) return [ticket, ...current];
          return current.map((entry) =>
            entry.ticketId === ticket.ticketId ? ticket : entry,
          );
        });
        setActiveTicketId(ticket.ticketId);
        toast.success(
          t("supportReport.toasts.closed", {
            defaultValue: "Ticket closed",
          }),
        );
      },
      onError: (error, _variables, context) => {
        const previousTickets = (
          context as { previousTickets?: SupportTicket[] } | undefined
        )?.previousTickets;
        if (previousTickets) {
          queryClient.setQueryData(SUPPORT_TICKETS_QUERY_KEY, previousTickets);
        }
        toast.error(
          error.message ||
            t("supportReport.toasts.closeError", {
              defaultValue: "Failed to close ticket",
            }),
        );
      },
    },
  );

  const submitReport = usePost<
    CreateSupportReportResponse,
    CreateSupportReportPayload
  >("support-reports", {
    method: "POST",
    invalidate: ["support-reports"],
    onMutate: (payload) => {
      const previousTickets = readTicketsCache();
      const hasActiveTicket = previousTickets.some(
        (ticket) => ticket.status !== "closed" && ticket.status !== "queued",
      );
      const now = new Date().toISOString();
      const tempTicketId = `TMP-${Date.now()}`;
      const authorName =
        user?.name?.trim() ||
        t("supportReport.inbox.you", {
          defaultValue: "You",
        });
      const optimisticTicket: SupportTicket = {
        ticketId: tempTicketId,
        createdAt: now,
        updatedAt: now,
        priority: computePriority(planTier, payload.type),
        planTier,
        status: hasActiveTicket ? "queued" : "open",
        type: payload.type,
        subject: payload.subject.trim(),
        pageUrl: payload.pageUrl ?? null,
        canReply: !hasActiveTicket,
        messages: [
          {
            id: `TMP-MSG-${Date.now()}`,
            authorRole: "user",
            authorName,
            content: payload.message.trim(),
            createdAt: now,
          },
        ],
      };

      writeTicketsCache((current) => [optimisticTicket, ...current]);
      setActiveTicketId(tempTicketId);
      return { previousTickets, tempTicketId };
    },
    onSuccess: (response, variables, context) => {
      const tempTicketId = (
        context as { tempTicketId?: string } | undefined
      )?.tempTicketId;
      const now = new Date().toISOString();
      const resolvedStatus: SupportTicketStatus = response.status || "open";

      writeTicketsCache((current) => {
        const normalizedPlanTier = resolvePlanTier(response.planTier);
        let replaced = false;
        const next = current.map((ticket) => {
          if (!tempTicketId || ticket.ticketId !== tempTicketId) {
            return ticket;
          }
          replaced = true;
          return {
            ...ticket,
            ticketId: response.ticketId,
            priority: response.priority,
            planTier: normalizedPlanTier,
            status: resolvedStatus,
            canReply: resolvedStatus !== "queued",
            updatedAt: now,
          };
        });

        if (replaced) return next;

        const fallbackTicket: SupportTicket = {
          ticketId: response.ticketId,
          createdAt: now,
          updatedAt: now,
          priority: response.priority,
          planTier: normalizedPlanTier,
          status: resolvedStatus,
          type: variables.type,
          subject: variables.subject.trim(),
          pageUrl: variables.pageUrl ?? null,
          canReply: resolvedStatus !== "queued",
          messages: [
            {
              id: `TMP-MSG-${Date.now()}`,
              authorRole: "user",
              authorName:
                user?.name?.trim() ||
                t("supportReport.inbox.you", {
                  defaultValue: "You",
                }),
              content: variables.message.trim(),
              createdAt: now,
            },
          ],
        };

        return [
          fallbackTicket,
          ...next,
        ];
      });

      setLastTicket(response.ticketId);
      setActiveTicketId(response.ticketId);
      setSubject("");
      setMessage("");
      toast.success(t("supportReport.toasts.success", { ticketId: response.ticketId }));

      if (resolvedStatus === "queued") {
        toast.info(
          t("supportReport.toasts.queued", {
            defaultValue:
              "Ticket queued. It will open automatically when your current open ticket is closed.",
          }),
        );
      } else if (!response.emailSent) {
        toast.warning(
          t("supportReport.toasts.emailDelayed", {
            defaultValue:
              "Ticket saved. Email delivery is delayed, follow updates directly in this page.",
          }),
        );
      }

      void ticketsQuery.refetch();
    },
    onError: (error, _variables, context) => {
      const previousTickets = (
        context as { previousTickets?: SupportTicket[] } | undefined
      )?.previousTickets;
      if (previousTickets) {
        queryClient.setQueryData(SUPPORT_TICKETS_QUERY_KEY, previousTickets);
      }
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

  const handleReplySubmit = () => {
    if (!activeTicket) return;

    const draft = (replyDrafts[activeTicket.ticketId] ?? "").trim();
    if (draft.length < 2) {
      toast.error(
        t("supportReport.validation.replyMin", {
          defaultValue: "Reply must contain at least 2 characters",
        }),
      );
      return;
    }

    sendReply.mutate({
      ticketId: activeTicket.ticketId,
      message: draft,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          supportResponder
            ? t("supportReport.inbox.superadminTitle", {
                defaultValue: "Support ticket inbox",
              })
            : t("supportReport.title")
        }
        description={
          supportResponder
            ? t("supportReport.inbox.superadminDescription", {
                defaultValue:
                  "Review incoming tickets from all salons, reply, and close them when resolved.",
              })
            : t("supportReport.description")
        }
      />

      {!supportResponder ? (
        <>
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
        </>
      ) : null}

      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">
              {t("supportReport.inbox.title", {
                defaultValue: supportResponder
                  ? "Support ticket inbox"
                  : "Your support tickets",
              })}
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void ticketsQuery.refetch()}
              disabled={ticketsQuery.isFetching}
            >
              <RefreshCcw
                className={`h-4 w-4 ${ticketsQuery.isFetching ? "animate-spin" : ""}`}
              />
              {t("supportReport.inbox.refresh", { defaultValue: "Refresh" })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ticketsQuery.isLoading && tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("supportReport.inbox.loading", {
                defaultValue: "Loading your tickets...",
              })}
            </p>
          ) : null}

          {!ticketsQuery.isLoading && tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("supportReport.inbox.empty", {
                defaultValue: supportResponder
                  ? "No tickets found."
                  : "No tickets yet. Submit your first report above and it will appear here.",
              })}
            </p>
          ) : null}

          {tickets.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-2">
                {tickets.map((ticket) => {
                  const active = ticket.ticketId === activeTicketId;
                  return (
                    <button
                      key={ticket.ticketId}
                      type="button"
                      onClick={() => setActiveTicketId(ticket.ticketId)}
                      className={`w-full rounded-lg border p-3 text-left transition hover:border-accent-pink-300 ${
                        active
                          ? "border-accent-pink-400 bg-accent-pink-50/40"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-semibold">{ticket.subject}</p>
                        <span className="text-[11px] text-muted-foreground">
                          {ticket.ticketId}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${priorityStyles[ticket.priority]}`}
                        >
                          {t(`supportReport.priorities.${ticket.priority}`)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${statusStyles[ticket.status]}`}
                        >
                          {t(`supportReport.status.${ticket.status}`, {
                            defaultValue: ticket.status.replace(/_/g, " "),
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDateTime(ticket.updatedAt)}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                {activeTicket ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold">{activeTicket.subject}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {supportResponder && activeTicket.status !== "closed" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              closeTicket.mutate({
                                ticketId: activeTicket.ticketId,
                              })
                            }
                            disabled={closeTicket.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {closeTicket.isPending
                              ? t("supportReport.inbox.closing", {
                                  defaultValue: "Closing...",
                                })
                              : t("supportReport.inbox.close", {
                                  defaultValue: "Close ticket",
                                })}
                          </Button>
                        ) : null}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${priorityStyles[activeTicket.priority]}`}
                        >
                          {t(`supportReport.priorities.${activeTicket.priority}`)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${statusStyles[activeTicket.status]}`}
                        >
                          {t(`supportReport.status.${activeTicket.status}`, {
                            defaultValue: activeTicket.status.replace(/_/g, " "),
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {t("supportReport.inbox.meta", {
                        defaultValue: "Created: {{createdAt}} | Updated: {{updatedAt}}",
                        createdAt: formatDateTime(activeTicket.createdAt),
                        updatedAt: formatDateTime(activeTicket.updatedAt),
                      })}
                    </p>

                    <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                      {activeTicket.messages.map((entry) => {
                        const supportMessage = entry.authorRole === "support";
                        return (
                          <div
                            key={entry.id}
                            className={`rounded-lg border p-3 ${
                              supportMessage
                                ? "border-accent-blue-200 bg-accent-blue-50/50"
                                : "border-border bg-background"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <span className="font-semibold">
                                {supportMessage
                                  ? t("supportReport.inbox.support", {
                                      defaultValue: "Beautiq Support",
                                    })
                                  : t("supportReport.inbox.you", {
                                      defaultValue: "You",
                                    })}
                              </span>
                              <span className="text-muted-foreground">
                                {formatDateTime(entry.createdAt)}
                              </span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm">{entry.content}</p>
                          </div>
                        );
                      })}
                    </div>

                    {activeTicket.canReply && activeTicket.status !== "closed" ? (
                      <div className="space-y-2">
                        <Label>
                          {t("supportReport.inbox.replyLabel", {
                            defaultValue: "Add a follow-up message",
                          })}
                        </Label>
                        <Textarea
                          value={replyDrafts[activeTicket.ticketId] ?? ""}
                          onChange={(event) =>
                            setReplyDrafts((prev) => ({
                              ...prev,
                              [activeTicket.ticketId]: event.target.value,
                            }))
                          }
                          placeholder={t("supportReport.inbox.replyPlaceholder", {
                            defaultValue:
                              "Share new details, screenshots context, or answer support questions...",
                          })}
                          className="min-h-24"
                          maxLength={4000}
                        />
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={handleReplySubmit}
                            disabled={
                              sendReply.isPending ||
                              (replyDrafts[activeTicket.ticketId] ?? "").trim().length < 2
                            }
                          >
                            <Send className="h-4 w-4" />
                            {sendReply.isPending
                              ? t("supportReport.inbox.replySending", {
                                  defaultValue: "Sending...",
                                })
                              : t("supportReport.inbox.replySubmit", {
                                  defaultValue: "Send reply",
                                })}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("supportReport.inbox.selectTicket", {
                      defaultValue: "Select a ticket to view the full conversation.",
                    })}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
