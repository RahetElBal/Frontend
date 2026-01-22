/**
 * Mock API for development
 * This simulates backend responses while the real API is being developed
 */

import type { User } from '@/types/user';
import { UserRole } from '@/types/user';

// ============================================
// MOCK DATA
// ============================================

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@beautiq.com',
    name: 'Admin User',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: UserRole.ADMIN,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'user@beautiq.com',
    name: 'John Doe',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    role: UserRole.USER,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

export interface MockClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalVisits: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastVisit: string | null;
  createdAt: string;
  updatedAt: string;
}

export const mockClients: MockClient[] = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Claire',
    email: 'marie.claire@email.com',
    phone: '+33 6 12 34 56 78',
    totalVisits: 47,
    totalSpent: 1240,
    loyaltyPoints: 1240,
    lastVisit: '2024-01-10T14:30:00Z',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
  },
  {
    id: '2',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@email.com',
    phone: '+33 6 98 76 54 32',
    totalVisits: 23,
    totalSpent: 680,
    loyaltyPoints: 680,
    lastVisit: '2024-01-08T10:00:00Z',
    createdAt: '2023-06-20T00:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
  },
  {
    id: '3',
    firstName: 'Emma',
    lastName: 'Bernard',
    email: 'emma.bernard@email.com',
    phone: '+33 6 55 44 33 22',
    totalVisits: 12,
    totalSpent: 420,
    loyaltyPoints: 420,
    lastVisit: '2024-01-05T16:00:00Z',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-05T16:00:00Z',
  },
];

export interface MockService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockServices: MockService[] = [
  {
    id: '1',
    name: 'Pose French',
    description: 'Manucure française classique',
    duration: 90,
    price: 45,
    category: 'Manucure',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Nail Art',
    description: 'Création artistique sur ongles',
    duration: 45,
    price: 35,
    category: 'Manucure',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Soin Visage',
    description: 'Soin hydratant complet du visage',
    duration: 60,
    price: 55,
    category: 'Soins',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

export interface MockProduct {
  id: string;
  name: string;
  reference: string;
  description: string;
  price: number;
  stock: number;
  alertThreshold: number;
  category: string;
  brand: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockProducts: MockProduct[] = [
  {
    id: '1',
    name: 'Vernis Rouge Passion',
    reference: 'VRP001',
    description: 'Vernis longue tenue rouge intense',
    price: 12,
    stock: 2,
    alertThreshold: 5,
    category: 'Vernis',
    brand: 'OPI',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Gel UV Premium',
    reference: 'GUV001',
    description: 'Gel UV professionnel haute qualité',
    price: 28,
    stock: 24,
    alertThreshold: 10,
    category: 'Gel',
    brand: 'Peggy Sage',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Lime à ongles Pro',
    reference: 'LAO001',
    description: 'Lime professionnelle double face',
    price: 5,
    stock: 5,
    alertThreshold: 10,
    category: 'Accessoires',
    brand: 'Beautiq',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export interface MockDashboardStats {
  revenue: {
    today: number;
    month: number;
    monthChange: number;
  };
  appointments: {
    today: number;
    upcoming: number;
  };
  clients: {
    total: number;
    new: number;
    newChange: number;
  };
  products: {
    lowStock: number;
    totalValue: number;
  };
}

export const mockDashboardStats: MockDashboardStats = {
  revenue: {
    today: 450,
    month: 12340,
    monthChange: 22,
  },
  appointments: {
    today: 12,
    upcoming: 47,
  },
  clients: {
    total: 247,
    new: 18,
    newChange: 12,
  },
  products: {
    lowStock: 3,
    totalValue: 2340,
  },
};

// ============================================
// MOCK API DELAY
// ============================================

const MOCK_DELAY = 500;

export function delay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// MOCK API HANDLERS
// ============================================

export const mockApi = {
  // Auth
  async login(email: string): Promise<{ user: User; token: string }> {
    await delay();
    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        role: UserRole.USER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { user: newUser, token: 'mock_token_' + newUser.id };
    }
    return { user, token: 'mock_token_' + user.id };
  },

  // Dashboard
  async getDashboardStats(): Promise<MockDashboardStats> {
    await delay();
    return mockDashboardStats;
  },

  // Clients
  async getClients(): Promise<MockClient[]> {
    await delay();
    return mockClients;
  },

  async getClient(id: string): Promise<MockClient | undefined> {
    await delay();
    return mockClients.find((c) => c.id === id);
  },

  async createClient(data: Partial<MockClient>): Promise<MockClient> {
    await delay();
    const newClient: MockClient = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      totalVisits: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      lastVisit: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockClients.push(newClient);
    return newClient;
  },

  async updateClient(id: string, data: Partial<MockClient>): Promise<MockClient> {
    await delay();
    const index = mockClients.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Client not found');
    mockClients[index] = {
      ...mockClients[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockClients[index];
  },

  async deleteClient(id: string): Promise<void> {
    await delay();
    const index = mockClients.findIndex((c) => c.id === id);
    if (index !== -1) mockClients.splice(index, 1);
  },

  // Services
  async getServices(): Promise<MockService[]> {
    await delay();
    return mockServices;
  },

  async getService(id: string): Promise<MockService | undefined> {
    await delay();
    return mockServices.find((s) => s.id === id);
  },

  // Products
  async getProducts(): Promise<MockProduct[]> {
    await delay();
    return mockProducts;
  },

  async getProduct(id: string): Promise<MockProduct | undefined> {
    await delay();
    return mockProducts.find((p) => p.id === id);
  },

  async getLowStockProducts(): Promise<MockProduct[]> {
    await delay();
    return mockProducts.filter((p) => p.stock <= p.alertThreshold);
  },

  // Users (Admin)
  async getUsers(): Promise<User[]> {
    await delay();
    return mockUsers;
  },

  async getUser(id: string): Promise<User | undefined> {
    await delay();
    return mockUsers.find((u) => u.id === id);
  },
};
