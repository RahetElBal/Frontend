import { useTranslation } from "react-i18next";
import { Check, X, CalendarOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User as UserType, StaffTimeOff } from "@/types/entities";
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
                {new Date(request.startDate).toLocaleDateString()} -{" "}
                {new Date(request.endDate).toLocaleDateString()}
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
    </Card>
  );
}
