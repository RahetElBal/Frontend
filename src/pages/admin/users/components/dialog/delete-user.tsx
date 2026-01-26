import { useTranslation } from "react-i18next";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePost } from "@/hooks/usePost";
import { toast } from "@/lib/toast";
import type { User } from "@/types/entities";
import { getDisplayName } from "@/common/utils";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: DeleteUserDialogProps) {
  const { t } = useTranslation();

  const { mutate: deleteUser, isPending: isDeleting } = usePost<void, void>(
    "users",
    {
      id: user?.id,
      method: "DELETE",
      onSuccess: () => {
        toast.success(t("common.delete") + " - " + t("common.success"));
        onOpenChange(false);
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.message || t("common.error"));
      },
    },
  );

  const handleDelete = () => {
    deleteUser();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer{" "}
            <strong>{user ? getDisplayName(user) : ""}</strong> ? Cette action
            est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t("common.loading") : t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
