// ============================================
// AUTH DTOs
// ============================================

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    role: string;
  };
}

export interface GoogleAuthResponse {
  url: string;
}

// ============================================
// USER DTOs
// ============================================

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  salonId?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  picture?: string;
  role?: string;
  isActive?: boolean;
}

// ============================================
// CLIENT DTOs
// ============================================

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ClientFilters {
  search?: string;
  isActive?: boolean;
  gender?: string;
  hasEmail?: boolean;
  hasPhone?: boolean;
  minVisits?: number;
  minSpent?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// ============================================
// SERVICE DTOs
// ============================================

export interface CreateServiceDto {
  name: string;
  description?: string;
  duration: number;
  price: number;
  categoryId?: string;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface ServiceFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// ============================================
// PRODUCT DTOs
// ============================================

export interface CreateProductDto {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  categoryId?: string;
  image?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price?: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  categoryId?: string;
  image?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  inStock?: boolean;
  lowStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// ============================================
// APPOINTMENT DTOs
// ============================================

export interface CreateAppointmentDto {
  clientId: string;
  serviceId: string;
  staffId?: string;
  date: string;
  startTime: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  clientId?: string;
  serviceId?: string;
  staffId?: string;
  date?: string;
  startTime?: string;
  notes?: string;
  status?: string;
}

export interface AppointmentFilters {
  clientId?: string;
  serviceId?: string;
  staffId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// ============================================
// SALE DTOs
// ============================================

export interface CreateSaleDto {
  clientId?: string;
  items: CreateSaleItemDto[];
  discount?: number;
  paymentMethod: string;
  notes?: string;
  appointmentId?: string;
  redeemLoyalty?: boolean;
}

export interface CreateSaleItemDto {
  type: "service" | "product";
  itemId: string;
  quantity: number;
  price: number;
  discount?: number;
}

export interface SaleFilters {
  clientId?: string;
  staffId?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// ============================================
// GIFT CARD DTOs
// ============================================

export interface CreateGiftCardDto {
  value: number;
  purchasedById?: string;
  expiresAt?: string;
}

export interface RedeemGiftCardDto {
  code: string;
  amount: number;
  clientId?: string;
}

export interface GiftCardFilters {
  status?: string;
  minValue?: number;
  maxValue?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// ============================================
// LOYALTY DTOs
// ============================================

export interface AdjustLoyaltyPointsDto {
  clientId: string;
  points: number;
  description?: string;
}

export interface RedeemLoyaltyPointsDto {
  clientId: string;
  points: number;
}

// ============================================
// CATEGORY DTOs
// ============================================

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

// ============================================
// UPLOAD DTOs
// ============================================

export interface UploadResponse {
  filename: string;
  path: string;
  url: string;
  mimetype: string;
  size: number;
}

// ============================================
// PAGINATION RESPONSE
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================
// ANALYTICS DTOs
// ============================================

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  groupBy?: "day" | "week" | "month";
}

export interface DashboardResponse {
  stats: {
    todayRevenue: number;
    todayAppointments: number;
    newClients: number;
    averageTicket: number;
    revenueChange: number;
    appointmentsChange: number;
    clientsChange: number;
    ticketChange: number;
  };
  recentAppointments: Array<{
    id: string;
    clientName: string;
    serviceName: string;
    time: string;
    status: string;
  }>;
  upcomingAppointments: Array<{
    id: string;
    clientName: string;
    serviceName: string;
    time: string;
  }>;
}
