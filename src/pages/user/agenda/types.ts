export type AppointmentModalState = {
  appointmentId: string | "create";
  mode: "view" | "edit" | "delete";
  prefillTime?: string;
  prefillDate?: string;
  prefillStaffId?: string;
  nonce?: number;
} | null;
