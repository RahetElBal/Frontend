import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  Send,
  Settings,
} from "lucide-react";

import { Badge } from "@/components/badge";
import { LoadingPanel } from "@/components/loading-panel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/navigation";
import { useGet, withParams } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";
import { toast } from "@/lib/toast";

type SocialPlatform = "instagram" | "tiktok";
type SocialContentType = "post" | "story";

interface SocialCapabilitiesResponse {
  salonId: string;
  planTier: string;
  planStatus: string;
  socialPublishingEnabled: boolean;
  allowed: boolean;
  allowedPlatforms: SocialPlatform[];
  allowedContentTypes: SocialContentType[];
  connectedPlatforms: SocialPlatform[];
  connections: {
    instagram: {
      connected: boolean;
      igUserId?: string;
      username?: string;
      connectedAt?: string;
      expiresAt?: string;
    };
    tiktok: {
      connected: boolean;
      openId?: string;
      connectedAt?: string;
      expiresAt?: string;
    };
  };
}

interface SocialPublishResult {
  platform: SocialPlatform;
  success: boolean;
  externalId?: string;
  status?: string;
  error?: string;
}

interface SocialPublishResponse {
  salonId: string;
  planTier: string;
  contentType: SocialContentType;
  success: boolean;
  results: SocialPublishResult[];
  attemptedAt: string;
}

interface PublishContentPayload {
  salonId?: string;
  contentType: SocialContentType;
  platforms: SocialPlatform[];
  mediaUrl: string;
  caption?: string;
}

interface StartOAuthPayload {
  platform: SocialPlatform;
  salonId?: string;
}

interface StartOAuthResponse {
  salonId: string;
  platform: SocialPlatform;
  authUrl: string;
  callbackUrl: string;
}

interface DisconnectSocialPayload {
  platform: SocialPlatform;
  salonId?: string;
}

interface DisconnectSocialResponse {
  salonId: string;
  platform: SocialPlatform;
  disconnected: boolean;
  connectedPlatforms: SocialPlatform[];
}

interface PublishFormState {
  contentType: SocialContentType;
  mediaUrl: string;
  caption: string;
  platforms: SocialPlatform[];
}

const PRO_LIKE_TIERS = new Set(["pro", "all-in", "all_in", "allin"]);

function getPlanLabel(planTier: string | undefined, t: (key: string) => string) {
  const normalized = String(planTier || "").toLowerCase();
  if (normalized === "standard") return t("plans.standard");
  if (normalized === "pro") return t("plans.pro");
  if (PRO_LIKE_TIERS.has(normalized) && normalized !== "pro") {
    return t("supportReport.planTier.allIn");
  }
  return planTier || t("common.unknown");
}

export function MarketingPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    salon: currentSalon,
    isSuperadmin,
    isAdmin,
    isLoading: userLoading,
  } = useUser();

  const [superadminSalonId, setSuperadminSalonId] = useState(
    currentSalon?.id || "",
  );
  const [form, setForm] = useState<PublishFormState>({
    contentType: "post",
    mediaUrl: "",
    caption: "",
    platforms: [],
  });
  const [lastPublishResult, setLastPublishResult] =
    useState<SocialPublishResponse | null>(null);

  const targetSalonId = isSuperadmin
    ? superadminSalonId.trim()
    : currentSalon?.id;

  const capabilitiesPath = useMemo(
    () =>
      withParams("social-publishing/capabilities", {
        salonId: isSuperadmin ? targetSalonId : undefined,
      }),
    [isSuperadmin, targetSalonId],
  );

  const {
    data: capabilities,
    isLoading: capabilitiesLoading,
    isFetching: capabilitiesFetching,
    refetch: refetchCapabilities,
  } = useGet<SocialCapabilitiesResponse>(capabilitiesPath, {
    enabled: isSuperadmin ? !!targetSalonId : !!currentSalon?.id,
    retry: 1,
  });

  const publishMutation = usePost<SocialPublishResponse, PublishContentPayload>(
    "social-publishing/publish",
    {
      onSuccess: (data) => {
        setLastPublishResult(data);
        toast.success("Content submitted to selected social platforms.");
      },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    },
  );
  const startOAuthMutation = usePost<StartOAuthResponse, StartOAuthPayload>(
    "social-publishing/oauth/start",
    {
      onSuccess: (data) => {
        window.location.assign(data.authUrl);
      },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    },
  );
  const disconnectMutation = usePost<
    DisconnectSocialResponse,
    DisconnectSocialPayload
  >("social-publishing/oauth/disconnect", {
    onSuccess: (_data, variables) => {
      const label = variables.platform === "instagram" ? "Instagram" : "TikTok";
      toast.success(`${label} disconnected.`);
      setForm((prev) => ({
        ...prev,
        platforms: prev.platforms.filter((item) => item !== variables.platform),
      }));
      void refetchCapabilities();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const allowedPlatforms = capabilities?.allowedPlatforms ?? [
    "instagram",
    "tiktok",
  ];
  const allowedContentTypes = capabilities?.allowedContentTypes ?? [
    "post",
    "story",
  ];
  const connections = capabilities?.connections;
  const connectedPlatforms = capabilities?.connectedPlatforms ?? [];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("socialOAuth");
    if (!status) {
      return;
    }

    const platformParam = params.get("platform");
    const platformLabel =
      platformParam === "instagram"
        ? "Instagram"
        : platformParam === "tiktok"
          ? "TikTok"
          : "Social account";
    const message =
      params.get("message") ||
      (status === "success"
        ? `${platformLabel} connected successfully.`
        : `${platformLabel} connection failed.`);

    if (status === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }

    params.delete("socialOAuth");
    params.delete("platform");
    params.delete("message");

    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
    void refetchCapabilities();
  }, [location.pathname, location.search, navigate, refetchCapabilities]);

  useEffect(() => {
    if (!capabilities) {
      return;
    }

    const selectable = (["instagram", "tiktok"] as SocialPlatform[]).filter(
      (platform) =>
        allowedPlatforms.includes(platform) && connectedPlatforms.includes(platform),
    );

    setForm((prev) => {
      const filtered = prev.platforms.filter((platform) =>
        selectable.includes(platform),
      );
      const nextPlatforms =
        filtered.length > 0 ? filtered : selectable.length > 0 ? [selectable[0]] : [];

      const unchanged =
        nextPlatforms.length === prev.platforms.length &&
        nextPlatforms.every((value, index) => value === prev.platforms[index]);

      if (unchanged) {
        return prev;
      }

      return {
        ...prev,
        platforms: nextPlatforms,
      };
    });
  }, [capabilities, allowedPlatforms, connectedPlatforms]);

  const blockingReasons = useMemo(() => {
    if (!capabilities || capabilities.allowed) return [];
    const reasons: string[] = [];
    if (capabilities.planStatus !== "active") {
      reasons.push("Salon plan is not active.");
    }
    if (!PRO_LIKE_TIERS.has(String(capabilities.planTier || "").toLowerCase())) {
      reasons.push("This feature requires Standard + or All-In.");
    }
    if (!capabilities.socialPublishingEnabled) {
      reasons.push("Social publishing is disabled in salon settings.");
    }
    return reasons;
  }, [capabilities]);

  if (userLoading) {
    return (
      <Card className="p-6">
        <LoadingPanel label={t("common.loading")} />
      </Card>
    );
  }

  if (!isAdmin && !isSuperadmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const togglePlatform = (platform: SocialPlatform, checked: boolean) => {
    setForm((prev) => {
      const nextPlatforms = checked
        ? Array.from(new Set([...prev.platforms, platform]))
        : prev.platforms.filter((item) => item !== platform);
      return {
        ...prev,
        platforms: nextPlatforms,
      };
    });
  };

  const validateForm = () => {
    if (!targetSalonId) {
      return "Salon is required for this action.";
    }
    if (!capabilities?.allowed) {
      return "Social publishing is not allowed for this salon.";
    }
    if (!form.mediaUrl.trim()) {
      return "Media URL is required.";
    }
    try {
      new URL(form.mediaUrl.trim());
    } catch {
      return "Please provide a valid public media URL.";
    }
    if (form.platforms.length === 0) {
      return "Select at least one platform.";
    }
    if (form.platforms.includes("instagram") && !connections?.instagram.connected) {
      return "Instagram is not connected.";
    }
    if (form.platforms.includes("tiktok") && !connections?.tiktok.connected) {
      return "TikTok is not connected.";
    }
    return null;
  };

  const handleConnectPlatform = (platform: SocialPlatform) => {
    if (!targetSalonId) {
      toast.error("Salon is required for this action.");
      return;
    }
    startOAuthMutation.mutate({
      platform,
      ...(isSuperadmin && targetSalonId ? { salonId: targetSalonId } : {}),
    });
  };

  const handleDisconnectPlatform = (platform: SocialPlatform) => {
    if (!targetSalonId) {
      toast.error("Salon is required for this action.");
      return;
    }
    disconnectMutation.mutate({
      platform,
      ...(isSuperadmin && targetSalonId ? { salonId: targetSalonId } : {}),
    });
  };

  const handlePublish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload: PublishContentPayload = {
      contentType: form.contentType,
      platforms: form.platforms,
      mediaUrl: form.mediaUrl.trim(),
      caption: form.caption.trim() || undefined,
      ...(isSuperadmin && targetSalonId ? { salonId: targetSalonId } : {}),
    };

    publishMutation.mutate(payload);
  };

  const connectingPlatform = startOAuthMutation.variables?.platform;
  const disconnectingPlatform = disconnectMutation.variables?.platform;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Publishing"
        description="Publish Instagram and TikTok posts/stories directly from your salon workspace."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetchCapabilities()}
            disabled={
              capabilitiesFetching || (isSuperadmin && !targetSalonId)
            }
          >
            <RefreshCcw
              className={`h-4 w-4 ${capabilitiesFetching ? "animate-spin" : ""}`}
            />
            Refresh Access
          </Button>
        }
      />

      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={capabilities?.allowed ? "success" : "warning"}>
            {capabilities?.allowed ? "Publishing Enabled" : "Publishing Blocked"}
          </Badge>
          {capabilities ? (
            <>
              <Badge variant="info">
                Plan: {getPlanLabel(capabilities.planTier, t)}
              </Badge>
              <Badge
                variant={
                  capabilities.planStatus === "active" ? "success" : "warning"
                }
              >
                Plan status: {capabilities.planStatus}
              </Badge>
              <Badge
                variant={
                  capabilities.socialPublishingEnabled ? "success" : "warning"
                }
              >
                Settings toggle:{" "}
                {capabilities.socialPublishingEnabled ? "enabled" : "disabled"}
              </Badge>
            </>
          ) : null}
        </div>

        {isSuperadmin ? (
          <div className="space-y-2">
            <Label htmlFor="targetSalonId">Target salon ID (superadmin)</Label>
            <Input
              id="targetSalonId"
              value={superadminSalonId}
              onChange={(event) => setSuperadminSalonId(event.target.value)}
              placeholder="Paste salon UUID"
            />
          </div>
        ) : null}

        {capabilitiesLoading ? (
          <LoadingPanel label="Checking social publishing access..." />
        ) : null}

        {!capabilities?.allowed && !capabilitiesLoading ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Publishing is currently blocked.</p>
                {blockingReasons.length > 0 ? (
                  <ul className="list-disc ps-4">
                    {blockingReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Check your salon plan and settings.</p>
                )}
                <div>
                  <Button asChild variant="link" className="h-auto p-0">
                    <Link to={ROUTES.SALON_SETTINGS}>
                      <Settings className="h-4 w-4" />
                      Open salon settings
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      <form onSubmit={handlePublish}>
        <Card className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contentType">Content type</Label>
              <Select
                value={form.contentType}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    contentType: value as SocialContentType,
                  }))
                }
              >
                <SelectTrigger id="contentType">
                  <SelectValue placeholder="Choose content type" />
                </SelectTrigger>
                <SelectContent>
                  {allowedContentTypes.includes("post") ? (
                    <SelectItem value="post">Post</SelectItem>
                  ) : null}
                  {allowedContentTypes.includes("story") ? (
                    <SelectItem value="story">Story</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaUrl">Public media URL</Label>
              <Input
                id="mediaUrl"
                value={form.mediaUrl}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, mediaUrl: event.target.value }))
                }
                placeholder="https://cdn.example.com/haircut.mp4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              value={form.caption}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, caption: event.target.value }))
              }
              placeholder="New style preview from today's transformation..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Connected accounts</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Instagram</p>
                  <Badge
                    variant={connections?.instagram.connected ? "success" : "warning"}
                  >
                    {connections?.instagram.connected ? "Connected" : "Not connected"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {connections?.instagram.connected
                    ? `IG user ID: ${connections.instagram.igUserId || "n/a"}`
                    : "Required before publishing to Instagram."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleConnectPlatform("instagram")}
                    disabled={
                      !capabilities?.allowed ||
                      startOAuthMutation.isPending ||
                      disconnectMutation.isPending
                    }
                  >
                    {startOAuthMutation.isPending &&
                    connectingPlatform === "instagram"
                      ? "Redirecting..."
                      : connections?.instagram.connected
                        ? "Reconnect"
                        : "Connect"}
                  </Button>
                  {connections?.instagram.connected ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDisconnectPlatform("instagram")}
                      disabled={
                        disconnectMutation.isPending || startOAuthMutation.isPending
                      }
                    >
                      {disconnectMutation.isPending &&
                      disconnectingPlatform === "instagram"
                        ? "Disconnecting..."
                        : "Disconnect"}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">TikTok</p>
                  <Badge variant={connections?.tiktok.connected ? "success" : "warning"}>
                    {connections?.tiktok.connected ? "Connected" : "Not connected"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {connections?.tiktok.connected
                    ? `Open ID: ${connections.tiktok.openId || "n/a"}`
                    : "Required before publishing to TikTok."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleConnectPlatform("tiktok")}
                    disabled={
                      !capabilities?.allowed ||
                      startOAuthMutation.isPending ||
                      disconnectMutation.isPending
                    }
                  >
                    {startOAuthMutation.isPending && connectingPlatform === "tiktok"
                      ? "Redirecting..."
                      : connections?.tiktok.connected
                        ? "Reconnect"
                        : "Connect"}
                  </Button>
                  {connections?.tiktok.connected ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDisconnectPlatform("tiktok")}
                      disabled={
                        disconnectMutation.isPending || startOAuthMutation.isPending
                      }
                    >
                      {disconnectMutation.isPending &&
                      disconnectingPlatform === "tiktok"
                        ? "Disconnecting..."
                        : "Disconnect"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Platforms</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border p-3">
                <Checkbox
                  checked={form.platforms.includes("instagram")}
                  onCheckedChange={(checked) =>
                    togglePlatform("instagram", checked === true)
                  }
                  disabled={
                    !allowedPlatforms.includes("instagram") ||
                    !connections?.instagram.connected
                  }
                />
                <span className="text-sm font-medium">Instagram</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border p-3">
                <Checkbox
                  checked={form.platforms.includes("tiktok")}
                  onCheckedChange={(checked) =>
                    togglePlatform("tiktok", checked === true)
                  }
                  disabled={
                    !allowedPlatforms.includes("tiktok") ||
                    !connections?.tiktok.connected
                  }
                />
                <span className="text-sm font-medium">TikTok</span>
              </label>
            </div>
            {connectedPlatforms.length === 0 ? (
              <p className="text-xs text-amber-700">
                Connect at least one social account to enable publishing.
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={
              publishMutation.isPending ||
              startOAuthMutation.isPending ||
              disconnectMutation.isPending ||
              capabilitiesLoading ||
              !capabilities?.allowed ||
              form.platforms.length === 0
            }
          >
            <Send className="h-4 w-4" />
            {publishMutation.isPending ? "Publishing..." : "Publish now"}
          </Button>
        </Card>
      </form>

      {lastPublishResult ? (
        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-semibold">Last publish result</h2>
          <p className="text-sm text-muted-foreground">
            Attempted at {new Date(lastPublishResult.attemptedAt).toLocaleString()}
          </p>
          <div className="space-y-2">
            {lastPublishResult.results.map((result) => (
              <div
                key={result.platform}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="font-medium capitalize">{result.platform}</p>
                  {result.externalId ? (
                    <p className="text-xs text-muted-foreground">
                      External ID: {result.externalId}
                    </p>
                  ) : null}
                  {result.error ? (
                    <p className="text-xs text-red-600">{result.error}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {result.success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">
                        {result.status || "published"}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700">failed</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
