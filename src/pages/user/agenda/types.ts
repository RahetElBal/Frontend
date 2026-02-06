export type AppointmentModalState = {
  appointmentId: string | "create";
  mode: "view" | "edit" | "delete";
  prefillTime?: string;
  prefillDate?: string;
  nonce?: number;
} | null;
