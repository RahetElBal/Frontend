import type { TFunction } from "i18next";
import { StatusBadge } from "../../components/status-badge";
import type { TimeOffStatus, User } from "@/types/entities";

export const getStaffName = (staffMembers: User[], staffId: string) => {
  const staff = staffMembers.find((s) => s.id === staffId);
  return staff ? `${staff.firstName} ${staff.lastName}` : "Unknown";
};

export const getTimeOffStatusBadge = (
  t: TFunction,
  status: TimeOffStatus,
) => {
  switch (status) {
    case "pending":
      return <StatusBadge variant="warning" label={t("staff.pending")} />;
    case "approved":
      return <StatusBadge variant="success" label={t("staff.approved")} />;
    case "rejected":
      return <StatusBadge variant="error" label={t("staff.rejected")} />;
    case "cancelled":
      return <StatusBadge variant="default" label={t("staff.cancelled")} />;
    default:
      return <StatusBadge label={status} />;
  }
};
