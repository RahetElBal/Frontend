import { useTranslation } from "react-i18next";
import { Users, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  onCreateAdmin: () => void;
}

export function EmptyState({ onCreateAdmin }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-12 text-center">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{t("admin.users.noUsers")}</h3>
      <p className="text-muted-foreground mb-4">
        Commencez par créer un administrateur
      </p>
      <div className="flex justify-center gap-3">
        <Button onClick={onCreateAdmin}>
          <UserCog className="h-4 w-4 me-2" />
          Ajouter un administrateur
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Un administrateur pourra ensuite créer des salons et y ajouter du staff
      </p>
    </Card>
  );
}
