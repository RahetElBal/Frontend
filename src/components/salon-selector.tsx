import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Users,
  ChevronRight,
  Loader2,
  LogOut,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { useSalon } from "@/contexts/SalonProvider";
import { useAuthentication } from "@/hooks/useAuthentication";
import type { Salon } from "@/types/entities";

interface SalonSelectorProps {
  onSelect?: (salon: Salon) => void;
}

export function SalonSelector({ onSelect }: SalonSelectorProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { salons, isLoading, selectSalon, clearSalon } = useSalon();
  const { logout } = useAuthentication();

  const handleSelect = (salon: Salon) => {
    selectSalon(salon);
    onSelect?.(salon);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-accent-pink/5 to-accent-blue/5">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-pink" />
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearSalon();
    logout();
    navigate("/login");
  };

  if (salons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-accent-pink/5 to-accent-blue/5 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("salon.noSalons")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("salon.noSalonsDescription")}
          </p>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            {t("auth.logout")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-accent-pink/5 to-accent-blue/5 p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-pink/10 mb-4">
            <Building2 className="h-8 w-8 text-accent-pink" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("salon.selectSalon")}</h1>
          <p className="text-muted-foreground">
            {t("salon.selectSalonDescription")}
          </p>
        </div>

        <div className="space-y-4">
          {salons.map((salon) => (
            <Card
              key={salon.id}
              className="p-6 cursor-pointer hover:shadow-lg hover:border-accent-pink/50 transition-all group"
              onClick={() => handleSelect(salon)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-linear-to-br from-accent-pink to-accent-blue flex items-center justify-center text-white">
                    {salon.logo ? (
                      <img
                        src={salon.logo}
                        alt={salon.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold">
                        {salon.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{salon.name}</h3>
                      <Badge variant={salon.isActive ? "success" : "warning"}>
                        {salon.isActive
                          ? t("common.active")
                          : t("common.inactive")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {salon.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {salon.address}
                        </span>
                      )}
                      {salon.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {salon.phone}
                        </span>
                      )}
                      {salon.users && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {salon.users.length} {t("admin.salons.users")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent-pink transition-colors" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
