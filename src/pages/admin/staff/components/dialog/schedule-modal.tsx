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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { User as UserType } from "@/pages/admin/users/types";
import type { StaffSchedule } from "../../types";
import type { DayOfWeek } from "../../enum";
import type { CreateScheduleDto } from "../../types";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMembers: UserType[];
  onSubmit: (data: CreateScheduleDto) => void;
  isLoading: boolean;
  editingSchedule: StaffSchedule | null;
}

export function ScheduleModal({
  isOpen,
  onClose,
  staffMembers,
  onSubmit,
  isLoading,
  editingSchedule,
}: ScheduleModalProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<CreateScheduleDto>({
    staffId: "",
    dayOfWeek: "monday",
    startTime: "09:00",
    endTime: "18:00",
    breakStartTime: "12:00",
    breakEndTime: "13:00",
    isWorking: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {editingSchedule ? t("staff.editSchedule") : t("staff.addSchedule")}
          </DialogTitle>
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
              <Label>{t("fields.day")}</Label>
              <Select
                value={formData.dayOfWeek}
                onValueChange={(value) =>
                  setFormData({ ...formData, dayOfWeek: value as DayOfWeek })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {t(`days.${day}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>{t("staff.isWorking")}</Label>
              <Switch
                checked={formData.isWorking}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isWorking: checked })
                }
              />
            </div>

            {formData.isWorking && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("fields.startTime")}</Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("fields.endTime")}</Label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("staff.breakStart")}</Label>
                    <Input
                      type="time"
                      value={formData.breakStartTime || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakStartTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("staff.breakEnd")}</Label>
                    <Input
                      type="time"
                      value={formData.breakEndTime || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakEndTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
