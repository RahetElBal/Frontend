import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface RecentCardProps {
  title: string;
  emptyIcon: ReactNode;
  emptyMessage: string;
  children: ReactNode;
  isEmpty: boolean;
}

export function RecentCard({
  title,
  emptyIcon,
  emptyMessage,
  children,
  isEmpty,
}: RecentCardProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {isEmpty ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="h-8 w-8 mx-auto mb-2 opacity-50">{emptyIcon}</div>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </Card>
  );
}
