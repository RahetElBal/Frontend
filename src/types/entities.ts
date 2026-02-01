// ============================================
// BASE ENTITY
// ============================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ROLE TYPES
// ============================================

// Role type - superadmin is determined by backend via env var, not stored in DB
export type AppRole = "superadmin" | "admin" | "user";

export const UserRole = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ============================================
// USER ENTITY
// ============================================

export interface User extends BaseEntity {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  role: AppRole;
  isActive: boolean;
  googleId?: string;
  lastLoginAt?: string;
  isSuperadmin?: boolean;
  salon: Salon;
  managedById?: string;
  managedBy?: User;
  phone: string;
}

// ============================================
// SALON ENTITY
// ============================================

export interface Salon extends BaseEntity {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  isActive: boolean;
  ownerId: string;
  owner?: User;
  settings?: SalonSettings;
  staff?: User[];
  createdBySuperadmin?: boolean;
}

export interface SalonSettings {
  currency: string;
  timezone: string;
  language: string;
  workingHours?: WorkingHours;
}

export interface WorkingHours {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

// ============================================
// CLIENT ENTITY
// ============================================

export const Gender = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export interface Client extends BaseEntity {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: Gender;
  address?: string;
  notes?: string;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
  isActive: boolean;
  salonId: string;
  salon?: Salon;
  appointments?: Appointment[];
  sales?: Sale[];
}

// ============================================
// SERVICE ENTITY
// ============================================

export interface Service extends BaseEntity {
  name: string;
  description?: string;
  duration: number;
  price: number;
  categoryId?: string;
  category?: Category | string;
  image?: string;
  isActive: boolean;
  salonId: string;
  salon?: Salon;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  salonId: string;
  services?: Service[];
  products?: Product[];
}

// ============================================
// PRODUCT ENTITY
// ============================================

export interface Product extends BaseEntity {
  name: string;
  description?: string;
  sku?: string;
  reference?: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  categoryId?: string;
  category?: Category | string;
  brand?: string;
  image?: string;
  isActive: boolean;
  salonId: string;
  salon?: Salon;
}

// ============================================
// APPOINTMENT ENTITY
// ============================================

export const AppointmentStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export interface Appointment extends BaseEntity {
  clientId: string;
  client?: Client;
  serviceId: string;
  service?: Service;
  staffId?: string;
  staff?: User;
  salonId: string;
  salon?: Salon;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  price: number;
  reminderSent: boolean;
}

// ============================================
// SALE ENTITY
// ============================================

export const PaymentMethod = {
  CASH: "cash",
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  OTHER: "other",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const SaleStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
} as const;

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];

export interface Sale extends BaseEntity {
  clientId?: string;
  client?: Client;
  staffId?: string;
  staff?: User;
  salonId: string;
  salon?: Salon;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  appointmentId?: string;
  appointment?: Appointment;
}

export interface SaleItem {
  id: string;
  type: "service" | "product";
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

// ============================================
// GIFT CARD ENTITY
// ============================================

export const GiftCardStatus = {
  ACTIVE: "active",
  REDEEMED: "redeemed",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export type GiftCardStatus =
  (typeof GiftCardStatus)[keyof typeof GiftCardStatus];

export interface GiftCard extends BaseEntity {
  code: string;
  initialValue: number;
  currentValue: number;
  status: GiftCardStatus;
  purchasedById?: string;
  purchasedBy?: Client;
  redeemedById?: string;
  redeemedBy?: Client;
  expiresAt?: string;
  salonId: string;
  salon?: Salon;
}

// ============================================
// LOYALTY ENTITY
// ============================================

export interface LoyaltyProgram extends BaseEntity {
  name: string;
  pointsPerCurrency: number; // points earned per currency unit spent
  redemptionRate: number; // currency value per point
  minimumPoints: number; // minimum points for redemption
  isActive: boolean;
  salonId: string;
  salon?: Salon;
  tiers?: LoyaltyTier[];
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  multiplier: number; // bonus multiplier for points
  benefits?: string[];
}

export interface LoyaltyTransaction extends BaseEntity {
  clientId: string;
  client?: Client;
  salonId: string;
  type: "earn" | "redeem" | "adjust" | "expire";
  points: number;
  description?: string;
  saleId?: string;
  sale?: Sale;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardStats {
  todayRevenue: number;
  todayAppointments: number;
  newClients: number;
  averageTicket: number;
  revenueChange: number;
  appointmentsChange: number;
  clientsChange: number;
  ticketChange: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  appointments: number;
}

export interface TopService {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

export interface ClientAnalytics {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  retentionRate: number;
  averageVisits: number;
  averageSpend: number;
}

// ============================================
// SUPERADMIN ANALYTICS (Platform-wide)
// ============================================

export interface PlatformStats {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalAppointments: number;
  salonsChange: number;
  usersChange: number;
  revenueChange: number;
}

export interface SalonPerformance {
  salonId: string;
  salonName: string;
  revenue: number;
  appointments: number;
  clients: number;
  activeUsers: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export const NotificationType = {
  APPOINTMENT_REMINDER: "appointment_reminder",
  APPOINTMENT_CONFIRMATION: "appointment_confirmation",
  APPOINTMENT_CANCELLATION: "appointment_cancellation",
  MARKETING: "marketing",
  LOYALTY: "loyalty",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification extends BaseEntity {
  type: NotificationType;
  recipientPhone: string;
  message: string;
  status: "pending" | "sent" | "failed";
  sentAt?: string;
  error?: string;
}

// ============================================
// STAFF SCHEDULE ENTITY
// ============================================

export const DayOfWeek = {
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
  SUNDAY: "sunday",
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export interface StaffSchedule extends BaseEntity {
  salonId: string;
  staffId: string;
  staff?: User;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isWorking: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

// ============================================
// STAFF TIME OFF ENTITY
// ============================================

export const TimeOffType = {
  VACATION: "vacation",
  SICK_LEAVE: "sick_leave",
  PERSONAL: "personal",
  MATERNITY: "maternity",
  PATERNITY: "paternity",
  BEREAVEMENT: "bereavement",
  UNPAID: "unpaid",
  OTHER: "other",
} as const;

export type TimeOffType = (typeof TimeOffType)[keyof typeof TimeOffType];

export const TimeOffStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export type TimeOffStatus = (typeof TimeOffStatus)[keyof typeof TimeOffStatus];

export interface StaffTimeOff extends BaseEntity {
  salonId: string;
  staffId: string;
  staff?: User;
  type: TimeOffType;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDayPeriod?: "morning" | "afternoon";
  reason?: string;
  approvedById?: string;
  approvedBy?: User;
  approvedAt?: string;
  approverNotes?: string;
}

// ============================================
// PROMOTION ENTITY
// ============================================

export const PromotionType = {
  PERCENTAGE: "percentage",
  FIXED_AMOUNT: "fixed_amount",
  BUY_X_GET_Y: "buy_x_get_y",
  FREE_SERVICE: "free_service",
  FREE_PRODUCT: "free_product",
  BUNDLE: "bundle",
} as const;

export type PromotionType = (typeof PromotionType)[keyof typeof PromotionType];

export const PromotionStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export type PromotionStatus =
  (typeof PromotionStatus)[keyof typeof PromotionStatus];

export const PromotionAppliesTo = {
  ALL: "all",
  SERVICES: "services",
  PRODUCTS: "products",
  SPECIFIC_ITEMS: "specific_items",
  CATEGORIES: "categories",
} as const;

export type PromotionAppliesTo =
  (typeof PromotionAppliesTo)[keyof typeof PromotionAppliesTo];

export interface Promotion extends BaseEntity {
  salonId: string;
  name: string;
  description?: string;
  code?: string;
  type: PromotionType;
  status: PromotionStatus;
  appliesTo: PromotionAppliesTo;
  discountValue?: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerClient?: number;
  timesUsed: number;
  startDate: string;
  endDate: string;
  applicableServiceIds?: string[];
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  isFirstTimeOnly: boolean;
  isBirthdayOnly: boolean;
  validDays?: string[];
  validTimeStart?: string;
  validTimeEnd?: string;
}

// ============================================
// SALON SETTINGS (EXTENDED)
// ============================================

export interface SalonSettingsExtended extends BaseEntity {
  salonId: string;

  // Business Settings
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";

  // Booking Settings
  bookingSlotDuration: number;
  bookingLeadTime: number;
  bookingWindowDays: number;
  cancellationDeadline: number;
  allowOnlineBooking: boolean;
  requireDeposit: boolean;
  depositAmount?: number;
  depositPercentage?: number;

  // Notification Settings
  sendAppointmentConfirmation: boolean;
  sendAppointmentReminder: boolean;
  reminderHoursBefore: number;
  sendBirthdayGreeting: boolean;
  sendReviewRequest: boolean;
  reviewRequestHoursAfter: number;

  // Tax Settings
  taxEnabled: boolean;
  taxRate: number;
  pricesIncludeTax: boolean;
  taxNumber?: string;

  // Loyalty Settings
  loyaltyEnabled: boolean;
  loyaltyPointsPerCurrency: number;
  loyaltyPointValue: number;
  loyaltyMinimumRedemption: number;

  // Receipt Settings
  receiptHeader?: string;
  receiptFooter?: string;
  showStaffOnReceipt: boolean;
  invoicePrefix?: string;
  invoiceNextNumber: number;

  // Working Hours
  workingHours?: {
    [day: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
      breakStart?: string;
      breakEnd?: string;
    };
  };
}

// ============================================
// AUDIT LOG (For tracking actions)
// ============================================

export const AuditAction = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LOGIN: "login",
  LOGOUT: "logout",
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export interface AuditLog extends BaseEntity {
  actorEmail: string;
  actorRole: AppRole;
  userId?: string;
  user?: User;
  action: AuditAction;
  entity: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}
