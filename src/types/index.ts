// Export all types from a single entry point

// Entities
export * from './entities';

// DTOs (excluding PaginatedResponse which is in api.ts)
export type {
  LoginResponse,
  GoogleAuthResponse,
  CreateUserDto,
  UpdateUserDto,
  CreateClientDto,
  UpdateClientDto,
  ClientFilters,
  CreateServiceDto,
  UpdateServiceDto,
  ServiceFilters,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilters,
  CreateSaleDto,
  CreateSaleItemDto,
  SaleFilters,
  CreateGiftCardDto,
  RedeemGiftCardDto,
  GiftCardFilters,
  AdjustLoyaltyPointsDto,
  RedeemLoyaltyPointsDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  UploadResponse,
  AnalyticsFilters,
  DashboardResponse,
} from './dto';

// API types
export * from './api';

// User types (includes AuthState)
export type { AuthState, AuthResponse } from './user';

// Navigation types
export * from './navigation';
