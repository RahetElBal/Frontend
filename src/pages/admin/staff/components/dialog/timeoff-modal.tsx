import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { User as UserType, TimeOffType } from "@/types/entities";
import type { CreateTimeOffDto } from "../../types";

const TIME_OFF_TYPES: TimeOffType[] = [
  "vacation",
  "sick_leave",
  "personal",
  "maternity",
  "paternity",
  "bereavement",
  "unpaid",
  "other",
];

interface TimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMembers: UserType[];
  onSubmit: (data: CreateTimeOffDto) => void;
  isLoading: boolean;
}

export function TimeOffModal({
  isOpen,
  onClose,
  staffMembers,
  onSubmit,
  isLoading,
}: TimeOffModalProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<CreateTimeOffDto>({
    staffId: "",
    type: "vacation",
    startDate: "",
    endDate: "",
    reason: "",
    isHalfDay: false,
    halfDayPeriod: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{t("staff.requestTimeOff")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("fields.staff")}</Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) =>
                  setFormData({ ...formData, staffId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("staff.selectStaff")} />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("fields.type")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as TimeOffType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OFF_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`staff.timeOffTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("fields.startDate")}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("fields.endDate")}</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>{t("staff.halfDay")}</Label>
              <Switch
                checked={formData.isHalfDay}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isHalfDay: checked })
                }
              />
            </div>

            {formData.isHalfDay && (
              <div className="space-y-2">
                <Label>{t("staff.period")}</Label>
                <Select
                  value={formData.halfDayPeriod || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      halfDayPeriod: value as "morning" | "afternoon",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("staff.selectPeriod")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">
                      {t("staff.morning")}
                    </SelectItem>
                    <SelectItem value="afternoon">
                      {t("staff.afternoon")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("fields.reason")}</Label>
              <Textarea
                value={formData.reason || ""}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                rows={3}
                placeholder={t("staff.reasonPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("staff.submitRequest")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
