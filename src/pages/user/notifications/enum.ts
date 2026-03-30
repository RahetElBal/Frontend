export const AdminNotificationType = {
  APPOINTMENT_CREATED: "appointment.created",
  APPOINTMENT_CONFIRMATION_PENDING: "appointment.confirmation.pending",
  APPOINTMENT_CANCELLED: "appointment.cancelled",
  APPOINTMENT_REMINDER: "appointment.reminder",
  APPOINTMENT_ASSIGNED: "appointment.assigned",
  APPOINTMENT_STATUS_UPDATED: "appointment.status.updated",
  APPOINTMENT_OVERDUE: "appointment.overdue",
  APPOINTMENT_PAYMENT_RECORDED: "appointment.payment.recorded",
  WHATSAPP_CONFIRMATION_SENT: "whatsapp.confirmation.sent",
  SALE_CREATED: "sale.created",
  SALE_COMPLETED: "sale.completed",
  SALE_REFUNDED: "sale.refunded",
  FREE_TRIAL_EXPIRY_REMINDER: "trial.expiry.reminder",
  SUPPORT_TICKET_CREATED: "support.ticket.created",
  SUPPORT_TICKET_CLOSED: "support.ticket.closed",
} as const;

export type AdminNotificationType =
  (typeof AdminNotificationType)[keyof typeof AdminNotificationType];
