import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, CalendarOff, User } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type {
  User as UserType,
  StaffSchedule,
  StaffTimeOff,
  TimeOffStatus,
} from "@/types/entities";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";
import { SchedulesView } from "./components/schedules-view";
import { TimeOffView } from "./components/timeoff-view";
import { ScheduleModal } from "./components/dialog/schedule-modal";
import { TimeOffModal } from "./components/dialog/timeoff-modal";
import type { CreateScheduleDto, CreateTimeOffDto } from "./types";

// TODO: Backend needs to implement these endpoints:
// - GET /staff-schedules?salonId={salonId}
// - POST /staff-schedules
// - PATCH /staff-schedules/{id}
// - DELETE /staff-schedules/{id}
// - GET /staff-time-off?salonId={salonId}
// - POST /staff-time-off
// - PATCH /staff-time-off/{id}

export function StaffPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"schedules" | "timeoff">(
    "schedules",
  );
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<StaffSchedule | null>(
    null,
  );

  const salonId = user?.salon?.id;

  // Fetch staff members (users) for the current salon
  const { data: staffMembers = [] } = useGet<UserType[]>("users", {
    params: { salonId },
    enabled: !!salonId,
  });

  // NOTE: These endpoints are not yet implemented in the backend API
  // For now, we'll use empty arrays as fallback
  const { data: schedules = [] } = useGet<StaffSchedule[]>("staff-schedules", {
    params: { salonId },
    enabled: !!salonId,
  });
  const { data: timeOffRequests = [] } = useGet<StaffTimeOff[]>(
    "staff-time-off",
    {
      params: { salonId },
      enabled: !!salonId,
    },
  );

  // Mutations - NOTE: These endpoints need to be implemented in backend
  const createSchedule = usePost<StaffSchedule, CreateScheduleDto>(
    "staff-schedules",
    {
      invalidateQueries: ["staff-schedules"],
      onSuccess: () => {
        toast.success(t("staff.scheduleUpdated"));
        setIsScheduleModalOpen(false);
      },
      onError: (error) => toast.error(error.message || t("common.error")),
    },
  );

  const createTimeOff = usePost<StaffTimeOff, CreateTimeOffDto>(
    "staff-time-off",
    {
      invalidateQueries: ["staff-time-off"],
      onSuccess: () => {
        toast.success(t("staff.timeOffRequested"));
        setIsTimeOffModalOpen(false);
      },
      onError: (error) => toast.error(error.message || t("common.error")),
    },
  );

  const approveTimeOff = usePost<StaffTimeOff, { status: TimeOffStatus }>(
    "staff-time-off",
    {
      method: "PATCH",
      invalidateQueries: ["staff-time-off"],
      onSuccess: () => toast.success(t("staff.timeOffApproved")),
      onError: (error) => toast.error(error.message),
    },
  );

  const filteredTimeOff = selectedStaff
    ? timeOffRequests.filter((t) => t.staffId === selectedStaff)
    : timeOffRequests;

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
            <Button
              variant="outline"
              onClick={() => setIsTimeOffModalOpen(true)}
            >
              <CalendarOff className="h-4 w-4 me-2" />
              {t("staff.requestTimeOff")}
            </Button>
            <Button onClick={() => setIsScheduleModalOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              {t("staff.addSchedule")}
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={cn(
            "px-4 py-2 -mb-px border-b-2 transition-colors",
            activeTab === "schedules"
              ? "border-accent-pink text-accent-pink"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setActiveTab("schedules")}
        >
          <Calendar className="h-4 w-4 inline-block me-2" />
          {t("staff.schedules")}
        </button>
        <button
          className={cn(
            "px-4 py-2 -mb-px border-b-2 transition-colors",
            activeTab === "timeoff"
              ? "border-accent-pink text-accent-pink"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setActiveTab("timeoff")}
        >
          <CalendarOff className="h-4 w-4 inline-block me-2" />
          {t("staff.timeOff")}
          {timeOffRequests.filter((r) => r.status === "pending").length > 0 && (
            <Badge variant="warning" className="ms-2">
              {timeOffRequests.filter((r) => r.status === "pending").length}
            </Badge>
          )}
        </button>
      </div>

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

      {activeTab === "schedules" ? (
        <SchedulesView
          staffMembers={staffMembers}
          selectedStaff={selectedStaff}
          getStaffScheduleForDay={getStaffScheduleForDay}
          onEditSchedule={(schedule) => {
            setEditingSchedule(schedule);
            setIsScheduleModalOpen(true);
          }}
        />
      ) : (
        <TimeOffView
          timeOffRequests={filteredTimeOff}
          staffMembers={staffMembers}
          onApprove={() => approveTimeOff.mutate({ status: "approved" })}
          onReject={() => approveTimeOff.mutate({ status: "rejected" })}
        />
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        staffMembers={staffMembers}
        onSubmit={(data) => createSchedule.mutate(data)}
        isLoading={createSchedule.isPending}
        editingSchedule={editingSchedule}
      />

      {/* Time Off Modal */}
      <TimeOffModal
        isOpen={isTimeOffModalOpen}
        onClose={() => setIsTimeOffModalOpen(false)}
        staffMembers={staffMembers}
        onSubmit={(data) => createTimeOff.mutate(data)}
        isLoading={createTimeOff.isPending}
      />
    </div>
  );
}
