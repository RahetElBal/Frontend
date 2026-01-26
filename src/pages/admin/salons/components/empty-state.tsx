import { useTranslation } from "react-i18next";
import { Building2, Plus, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  isSuperadmin: boolean;
  hasAdmins: boolean;
  onCreateSalon: () => void;
}

export function EmptyState({
  isSuperadmin,
  hasAdmins,
  onCreateSalon,
}: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-12 text-center">
      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {t("admin.salons.noSalons")}
      </h3>
      <p className="text-muted-foreground mb-4">
        {isSuperadmin && !hasAdmins
          ? "Créez d'abord un administrateur, puis créez un salon et assignez-le à cet administrateur."
          : t("admin.salons.addFirstSalon")}
      </p>
      {isSuperadmin && !hasAdmins ? (
        <Button
          onClick={() => {
            window.location.href = "/admin/users";
          }}
        >
          <Users className="h-4 w-4 me-2" />
          Créer un administrateur
        </Button>
      ) : (
        <Button onClick={onCreateSalon}>
          <Plus className="h-4 w-4 me-2" />
          {t("admin.salons.addSalon")}
        </Button>
      )}
    </Card>
  );
}
