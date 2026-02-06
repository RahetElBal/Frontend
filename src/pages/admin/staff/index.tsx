import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, User } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import type { User as UserType, StaffSchedule } from "@/types/entities";
import type { PaginatedResponse } from "@/types";
import { useGet, withParams } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";
import { SchedulesView } from "./components/schedules-view";
import { ScheduleModal } from "./components/dialog/schedule-modal";
import type { CreateScheduleDto } from "./types";

export function StaffPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<StaffSchedule | null>(
    null,
  );

  const salonId = user?.salon?.id;

  // Fetch staff members (users) for the current salon
  const { data: staffMembersResponse } = useGet<PaginatedResponse<UserType>>(
    withParams("users", { salonId, role: "user" }),
    { enabled: !!salonId },
  );
  const staffMembers = staffMembersResponse?.data ?? [];

  // NOTE: These endpoints are not yet implemented in the backend API
  // For now, we'll use empty arrays as fallback
  const { data: schedulesResponse } = useGet<StaffSchedule[]>(
    withParams("staff-schedules", { salonId }),
    { enabled: !!salonId },
  );
  const schedules = Array.isArray(schedulesResponse) ? schedulesResponse : [];

  // Mutations - NOTE: These endpoints need to be implemented in backend
  const createSchedule = usePost<StaffSchedule, CreateScheduleDto>(
    "staff-schedules",
    {
      invalidate: ["staff-schedules"],
      onSuccess: () => {
        toast.success(t("staff.scheduleUpdated"));
        setIsScheduleModalOpen(false);
      },
      onError: (error) => toast.error(error.message || t("common.error")),
    },
  );

  const getStaffScheduleForDay = (staffId: string, day: string) => {
    return schedules.find((s) => s.staffId === staffId && s.dayOfWeek === day);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.staff")}
        description={t("staff.description")}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setIsScheduleModalOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              {t("staff.addSchedule")}
            </Button>
          </div>
        }
      />

      {/* Staff Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedStaff === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStaff(null)}
        >
          {t("common.all")}
        </Button>
        {staffMembers.map((staff) => (
          <Button
            key={staff.id}
            variant={selectedStaff === staff.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStaff(staff.id)}
            className="gap-2"
          >
            {staff.picture ? (
              <img
                src={staff.picture}
                alt={staff.firstName}
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            {staff.firstName} {staff.lastName}
          </Button>
        ))}
      </div>

      <SchedulesView
        staffMembers={staffMembers}
        selectedStaff={selectedStaff}
        getStaffScheduleForDay={getStaffScheduleForDay}
        onEditSchedule={(schedule) => {
          setEditingSchedule(schedule);
          setIsScheduleModalOpen(true);
        }}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        staffMembers={staffMembers}
        onSubmit={(data) => {
          if (!salonId) {
            toast.error(t("common.error"));
            return;
          }
          createSchedule.mutate({ ...data, salonId });
        }}
        isLoading={createSchedule.isPending}
        editingSchedule={editingSchedule}
      />
    </div>
  );
}
