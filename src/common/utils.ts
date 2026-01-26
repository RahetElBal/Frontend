import type { User } from "@/types/entities";
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const getDisplayName = (user: User): string => {
  const userName = (user as User & { name?: string }).name;
  return (
    userName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A"
  );
};

/**
 * Get user initials for avatar
 */
export const getInitials = (user: User): string => {
  const name = getDisplayName(user);
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};
