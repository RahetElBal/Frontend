import { useTranslation } from "react-i18next";
import { Check, X, CalendarOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSalonDateTime } from "@/hooks/useSalonDateTime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User as UserType } from "@/pages/admin/users/types";
import type { StaffTimeOff } from "../types";
import { getStaffName, getTimeOffStatusBadge } from "./utils";

interface TimeOffViewProps {
  timeOffRequests: StaffTimeOff[];
  staffMembers: UserType[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function TimeOffView({
  timeOffRequests,
  staffMembers,
  onApprove,
  onReject,
}: TimeOffViewProps) {
  const { t } = useTranslation();
  const { formatDate } = useSalonDateTime();

  const staffName = (staffId: string) => getStaffName(staffMembers, staffId);

  if (timeOffRequests.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CalendarOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">{t("staff.noTimeOffRequests")}</h3>
        <p className="text-muted-foreground">
          {t("staff.noTimeOffRequestsDescription")}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-3 p-4 md:hidden">
        {timeOffRequests.map((request) => (
          <div
            key={request.id}
            className="space-y-3 rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t("fields.staff")}
              </p>
              <p className="text-sm font-medium">{staffName(request.staffId)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t("fields.type")}
              </p>
              <p className="text-sm">{t(`staff.timeOffTypes.${request.type}`)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t("fields.dates")}
              </p>
              <p className="text-sm">
                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                {request.isHalfDay && (
                  <span className="text-xs text-muted-foreground ms-1">
                    ({t(`staff.${request.halfDayPeriod}`)})
                  </span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t("fields.reason")}
              </p>
              <p className="text-sm">{request.reason || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t("fields.status")}
              </p>
              <div>{getTimeOffStatusBadge(t, request.status)}</div>
            </div>
            {request.status === "pending" && (
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-green-600 hover:text-green-700"
                  onClick={() => onApprove(request.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={() => onReject(request.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("fields.staff")}</TableHead>
              <TableHead>{t("fields.type")}</TableHead>
              <TableHead>{t("fields.dates")}</TableHead>
              <TableHead>{t("fields.reason")}</TableHead>
              <TableHead>{t("fields.status")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeOffRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {staffName(request.staffId)}
                </TableCell>
                <TableCell>{t(`staff.timeOffTypes.${request.type}`)}</TableCell>
                <TableCell>
                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  {request.isHalfDay && (
                    <span className="text-xs text-muted-foreground ms-1">
                      ({t(`staff.${request.halfDayPeriod}`)})
                    </span>
                  )}
                </TableCell>
                <TableCell className="max-w-50 truncate">
                  {request.reason || "-"}
                </TableCell>
                <TableCell>{getTimeOffStatusBadge(t, request.status)}</TableCell>
                <TableCell className="text-end">
                  {request.status === "pending" && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => onApprove(request.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onReject(request.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
