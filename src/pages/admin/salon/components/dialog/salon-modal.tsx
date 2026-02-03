// src/pages/admin/salons/components/dialog/salon-modal.tsx
import { useMemo, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Salon, User } from "@/types/entities";
import { toast } from "@/lib/toast";
import { uploadFile } from "@/lib/http";
import { usePost } from "@/hooks/usePost";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { canModifySalon, type SalonModalState } from "../../utils";
import { createSalonFormSchema, type SalonFormData } from "../../validation";
import React from "react";
import { parseValidationMsg } from "@/common/validator/zodI18n";
import { normalizePhone } from "@/common/phone";
import { detectAddress } from "@/common/geo";

interface SalonModalProps {
  modalState: SalonModalState;
  setModalState: (state: SalonModalState) => void;
  salons: Salon[];
  user: User | null;
  admins: User[];
  onSuccess: () => void;
}

export function SalonModals({
  modalState,
  setModalState,
  salons,
  user,
  admins,
  onSuccess,
}: SalonModalProps) {
  const { t } = useTranslation();
  const getErrorMessage = (message?: string): string | undefined => {
    if (!message) return undefined;
    if (message.startsWith("validation.") || message.startsWith("errors.")) {
      const { key, params } = parseValidationMsg(message);
      return t(key, params);
    }
    return message;
  };

  // Derive selected salon from modalState
  const selectedSalon = useMemo(() => {
    if (!modalState || modalState.salonId === "create") return null;
    return salons.find((s) => s.id === modalState.salonId) || null;
  }, [modalState, salons]);

  // Form setup with zodResolver
  const form = useForm<SalonFormData>({
    resolver: zodResolver(createSalonFormSchema(t)),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      logo: "",
    },
  });

  // Owner selection state (for superadmin only)
  const [selectedOwnerId, setSelectedOwnerId] = React.useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropMeta, setCropMeta] = useState<{
    width: number;
    height: number;
    baseScale: number;
  } | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const cropPreviewSize = 200;

  // Mutations - defined inside the modal component
  const { mutate: createSalonMutate, isPending: isCreating } = usePost<
    Salon,
    SalonFormData & { ownerId?: string }
  >("salons", {
    onSuccess: () => {
      toast.success(t("admin.salons.addSalon") + " - " + t("common.success"));
      setModalState(null);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: updateSalonMutate, isPending: isUpdating } = usePost<
    Salon,
    SalonFormData & { ownerId?: string }
  >("salons", {
    id: selectedSalon?.id,
    method: "PATCH",
    onSuccess: () => {
      toast.success(t("common.edit") + " - " + t("common.success"));
      setModalState(null);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const { mutate: deleteSalonMutate, isPending: isDeleting } = usePost<
    void,
    { salonId: string }
  >("salons", {
    id: (variables) => variables.salonId,
    method: "DELETE",
    onSuccess: () => {
      toast.success(t("common.delete") + " - " + t("common.success"));
      setModalState(null);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Derive all state from modalState
  const derived = useMemo(() => {
    if (!modalState) return null;

    const salonId = modalState.salonId;
    const isCreateMode = salonId === "create";
    const isSuperadmin = user?.isSuperadmin === true;
    const isAdmin = user?.role === "admin";

    return {
      mode: modalState.mode,
      salonId,
      isCreateMode,
      isSuperadmin,
      isAdmin,
      canModify: selectedSalon ? canModifySalon(selectedSalon, user) : false,
      isOwnSalon: selectedSalon?.ownerId === user?.id,
      isPending: isCreating || isUpdating || isDeleting,
    };
  }, [modalState, selectedSalon, user, isCreating, isUpdating, isDeleting]);

  const logoValue = form.watch("logo");
  const displayLogo = logoPreview || logoValue || selectedSalon?.logo || "";

  const [isDetectingAddress, setIsDetectingAddress] = useState(false);

  const clampCropOffset = (
    offset: { x: number; y: number },
    zoom: number,
  ) => {
    if (!cropMeta) return offset;
    const displayWidth = cropMeta.width * cropMeta.baseScale * zoom;
    const displayHeight = cropMeta.height * cropMeta.baseScale * zoom;
    const maxX = Math.max(0, (displayWidth - cropPreviewSize) / 2);
    const maxY = Math.max(0, (displayHeight - cropPreviewSize) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, offset.x)),
      y: Math.min(maxY, Math.max(-maxY, offset.y)),
    };
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setIsCropOpen(true);
  };

  const handleCropImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const baseScale = Math.max(
      cropPreviewSize / image.naturalWidth,
      cropPreviewSize / image.naturalHeight,
    );
    setCropMeta({
      width: image.naturalWidth,
      height: image.naturalHeight,
      baseScale,
    });
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
  };

  const handleCropPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: cropOffset.x,
      offsetY: cropOffset.y,
    };
  };

  const handleCropPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    const nextOffset = {
      x: dragRef.current.offsetX + dx,
      y: dragRef.current.offsetY + dy,
    };
    setCropOffset(clampCropOffset(nextOffset, cropZoom));
  };

  const handleCropPointerUp = () => {
    dragRef.current = null;
  };

  const buildCroppedBlob = async (): Promise<Blob | null> => {
    if (!logoPreview || !cropMeta) return null;
    const image = new Image();
    image.src = logoPreview;
    await image.decode();

    const canvas = document.createElement("canvas");
    const outputSize = 600;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scale = cropMeta.baseScale * cropZoom;
    const displayWidth = cropMeta.width * scale;
    const displayHeight = cropMeta.height * scale;
    const imgX = cropPreviewSize / 2 - displayWidth / 2 + cropOffset.x;
    const imgY = cropPreviewSize / 2 - displayHeight / 2 + cropOffset.y;
    const sourceSize = Math.min(
      cropMeta.width,
      cropPreviewSize / scale,
    );

    const rawSourceX = (0 - imgX) / scale;
    const rawSourceY = (0 - imgY) / scale;
    const maxSourceX = cropMeta.width - sourceSize;
    const maxSourceY = cropMeta.height - sourceSize;
    const sourceX = Math.min(Math.max(rawSourceX, 0), maxSourceX);
    const sourceY = Math.min(Math.max(rawSourceY, 0), maxSourceY);

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      outputSize,
      outputSize,
    );

    return await new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9),
    );
  };

  const handleCropSave = async () => {
    if (!logoPreview) return;
    try {
      setIsUploadingLogo(true);
      const blob = await buildCroppedBlob();
      if (!blob) {
        toast.error(t("common.error"));
        return;
      }
      const file = new File([blob], `salon-${Date.now()}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      const response = await uploadFile<{ url: string }>(
        "uploads/salons",
        file,
      );
      form.setValue("logo", response.url, { shouldDirty: true });
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(response.url);
      setIsCropOpen(false);
      toast.success(t("success.saved"));
    } catch (error) {
      toast.error(t("common.error"));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleCropCancel = () => {
    setIsCropOpen(false);
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(form.getValues("logo") || null);
  };

  const handleDetectAddress = async () => {
    setIsDetectingAddress(true);
    try {
      const result = await detectAddress();
      if (result.displayAddress) {
        form.setValue("address", result.displayAddress);
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsDetectingAddress(false);
    }
  };

  // Reset form when modal opens or changes
  useEffect(() => {
    if (!modalState) {
      form.clearErrors();
      setLogoPreview(null);
      return;
    }

    const isCreateMode = modalState.salonId === "create";
    const mode = modalState.mode;

    if (isCreateMode && mode === "edit") {
      setTimeout(() => {
        form.reset(
          { name: "", address: "", phone: "", email: "", logo: "" },
          {
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
            keepIsSubmitted: false,
          }
        );
        setSelectedOwnerId("");
        setLogoPreview(null);
      }, 0);
    } else if (selectedSalon && mode === "edit") {
      setTimeout(() => {
        form.reset(
          {
            name: selectedSalon.name,
            address: selectedSalon.address || "",
            phone: selectedSalon.phone || "",
            email: selectedSalon.email || "",
            logo: selectedSalon.logo || "",
          },
          {
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
            keepIsSubmitted: false,
          }
        );
        setSelectedOwnerId(selectedSalon.ownerId || "");
        setLogoPreview(selectedSalon.logo || null);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState?.salonId, modalState?.mode, selectedSalon?.id]);

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  if (!derived) return null;

  const handleClose = () => {
    setIsCropOpen(false);
    setModalState(null);
  };

  const handleSubmit = (data: SalonFormData) => {
    if (derived.isSuperadmin && derived.isCreateMode && !selectedOwnerId) {
      toast.error(t("admin.salons.selectOwnerRequired"));
      return;
    }

    const payload = {
      ...data,
      logo: data.logo?.trim() || undefined,
      ...(derived.isSuperadmin && { ownerId: selectedOwnerId }),
    };

    // CRUD logic based on salonId
    if (derived.isCreateMode) {
      createSalonMutate(payload);
    } else {
      updateSalonMutate(payload);
    }
  };

  const handleDelete = () => {
    if (!selectedSalon?.id) {
      toast.error("Erreur: ID salon manquant");
      return;
    }
    deleteSalonMutate({ salonId: selectedSalon.id });
  };

  // DELETE MODE
  if (derived.mode === "delete") {
    return (
      <AlertDialog open={!!modalState} onOpenChange={handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.salons.deleteSalonConfirm", {
                name: selectedSalon?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={derived.isPending}
            >
              {derived.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // VIEW MODE
  if (derived.mode === "view") {
    return (
      <Dialog open={!!modalState} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSalon?.name}</DialogTitle>
            <DialogDescription>
              {t("admin.salons.viewSalonDetails")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSalon?.logo && (
              <div className="flex items-center gap-3">
                <img
                  src={selectedSalon.logo}
                  alt={selectedSalon.name}
                  className="h-16 w-16 rounded-lg object-cover"
                  loading="lazy"
                />
                <div>
                  <Label>{t("admin.salons.logo")}</Label>
                  <p className="text-sm text-muted-foreground break-all">
                    {selectedSalon.logo}
                  </p>
                </div>
              </div>
            )}
            <div>
              <Label>{t("admin.salons.address")}</Label>
              <p className="text-sm text-muted-foreground">
                {selectedSalon?.address || "-"}
              </p>
            </div>
            <div>
              <Label>{t("admin.salons.phone")}</Label>
              <p className="text-sm text-muted-foreground">
                {selectedSalon?.phone || "-"}
              </p>
            </div>
            <div>
              <Label>{t("admin.salons.email")}</Label>
              <p className="text-sm text-muted-foreground">
                {selectedSalon?.email || "-"}
              </p>
            </div>
            {derived.isSuperadmin && (
              <div>
                <Label>{t("admin.salons.owner")}</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedSalon?.owner?.email || "-"}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t("common.close")}
            </Button>
            {derived.canModify && (
              <Button
                onClick={() =>
                  setModalState({ salonId: derived.salonId, mode: "edit" })
                }
              >
                {t("common.edit")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // EDIT/CREATE MODE
  if (derived.mode === "edit") {
    return (
      <>
        <Dialog open={!!modalState} onOpenChange={handleClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {derived.isCreateMode
                  ? t("admin.salons.addSalon")
                  : t("admin.salons.editSalon")}
              </DialogTitle>
              <DialogDescription>
                {derived.isCreateMode
                  ? t("admin.salons.addSalonDescription")
                  : t("admin.salons.editSalonDescription")}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
            <div>
              <Label htmlFor="name">{t("admin.salons.name")} *</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {getErrorMessage(
                    form.formState.errors.name.message as string
                  )}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="address">{t("admin.salons.address")}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDetectAddress}
                  disabled={isDetectingAddress}
                >
                  {isDetectingAddress
                    ? t("common.loading")
                    : t("common.detectAddress")}
                </Button>
              </div>
              <Input id="address" {...form.register("address")} />
            </div>
            <div>
              <Label htmlFor="phone">{t("admin.salons.phone")}</Label>
              <Input
                id="phone"
                {...form.register("phone", {
                  onBlur: (event) => {
                    const normalized = normalizePhone(event.target.value);
                    if (normalized) {
                      form.setValue("phone", normalized);
                    }
                  },
                })}
              />
            </div>
            <div>
              <Label htmlFor="email">{t("admin.salons.email")}</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {getErrorMessage(
                    form.formState.errors.email.message as string
                  )}
                </p>
              )}
            </div>
            <div>
              <Label>{t("admin.salons.logo")}</Label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {displayLogo ? (
                    <img
                      src={displayLogo}
                      alt={form.getValues("name") || "Salon"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t("common.noResults")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("common.upload")}
                  </Button>
                  {displayLogo && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        form.setValue("logo", "", { shouldDirty: true });
                        setLogoPreview(null);
                      }}
                    >
                      {t("common.remove")}
                    </Button>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoFileChange}
              />
              <input type="hidden" {...form.register("logo")} />
              {form.formState.errors.logo && (
                <p className="text-sm text-destructive mt-1">
                  {getErrorMessage(
                    form.formState.errors.logo.message as string
                  )}
                </p>
              )}
            </div>
            {derived.isSuperadmin && (
              <div>
                <Label htmlFor="owner">{t("admin.salons.owner")} *</Label>
                <Select
                  value={selectedOwnerId}
                  onValueChange={setSelectedOwnerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.salons.selectOwner")} />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        {t("admin.salons.noAdmins")}
                      </div>
                    ) : (
                      admins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {admins.length === 0 && (
                  <Button
                    type="button"
                    variant="link"
                    className="mt-2 p-0"
                    onClick={() => {
                      setModalState(null);
                      window.location.href = "/admin/users";
                    }}
                  >
                    {t("admin.salons.createAdmin")}
                  </Button>
                )}
              </div>
            )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={derived.isPending}>
                  {derived.isPending
                    ? t("common.saving")
                    : derived.isCreateMode
                    ? t("common.create")
                    : t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isCropOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCropCancel();
              return;
            }
            setIsCropOpen(true);
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("admin.salons.cropImage")}</DialogTitle>
              <DialogDescription>
                {t("admin.salons.cropImageDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div
                className="relative mx-auto h-[200px] w-[200px] overflow-hidden rounded-lg border bg-muted touch-none"
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerUp}
                onPointerCancel={handleCropPointerUp}
              >
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt={t("admin.salons.logo")}
                    onLoad={handleCropImageLoad}
                    className="absolute left-1/2 top-1/2 select-none"
                    style={{
                      width: cropMeta
                        ? `${cropMeta.width * cropMeta.baseScale}px`
                        : `${cropPreviewSize}px`,
                      height: cropMeta
                        ? `${cropMeta.height * cropMeta.baseScale}px`
                        : `${cropPreviewSize}px`,
                      transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                    }}
                    draggable={false}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("admin.salons.zoom")}</Label>
                <Input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={cropZoom}
                  onChange={(event) => {
                    const nextZoom = Number(event.target.value);
                    setCropZoom(nextZoom);
                    setCropOffset((prev) => clampCropOffset(prev, nextZoom));
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCropCancel}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleCropSave}
                disabled={isUploadingLogo}
              >
                {isUploadingLogo ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
}
