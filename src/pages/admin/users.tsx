import { useTranslation } from 'react-i18next';
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Shield } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/badge';
import { DataTable, type Column } from '@/components/table/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTable } from '@/hooks/useTable';
import { UserRole } from '@/types/entities';

// Mock users data for admin
const mockAllUsers = [
  {
    id: 'user-1',
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie@beautiq.com',
    role: UserRole.USER,
    isActive: true,
    salonName: 'Beautiq Paris',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@beautiq.com',
    role: UserRole.ADMIN,
    isActive: true,
    salonName: null,
    createdAt: '2023-06-01T00:00:00Z',
  },
  {
    id: 'user-3',
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean@glamour.com',
    role: UserRole.USER,
    isActive: true,
    salonName: 'Glamour Studio',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'user-4',
    firstName: 'Sophie',
    lastName: 'Leroy',
    email: 'sophie@style.com',
    role: UserRole.USER,
    isActive: false,
    salonName: 'Style & Co',
    createdAt: '2023-12-15T00:00:00Z',
  },
  {
    id: 'user-5',
    firstName: 'Pierre',
    lastName: 'Bernard',
    email: 'pierre@beautybar.com',
    role: UserRole.USER,
    isActive: true,
    salonName: 'Beauty Bar',
    createdAt: '2024-01-10T00:00:00Z',
  },
];

type AdminUser = typeof mockAllUsers[0];

export function AdminUsersPage() {
  const { t } = useTranslation();

  const table = useTable<AdminUser>({
    data: mockAllUsers,
    searchKeys: ['firstName', 'lastName', 'email', 'salonName'],
  });

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent-pink/10 flex items-center justify-center">
            <span className="font-medium text-accent-pink">
              {user.firstName[0]}
              {user.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('fields.role'),
      render: (user) => (
        <Badge variant={user.role === UserRole.ADMIN ? 'info' : 'default'}>
          <Shield className="h-3 w-3 me-1" />
          {user.role}
        </Badge>
      ),
    },
    {
      key: 'salonName',
      header: t('fields.salon'),
      render: (user) =>
        user.salonName || <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'status',
      header: t('fields.status'),
      render: (user) => (
        <Badge variant={user.isActive ? 'success' : 'error'}>
          {user.isActive ? t('common.active') : t('common.inactive')}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: t('fields.createdAt'),
      sortable: true,
      render: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 me-2" />
              {t('common.view')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 me-2" />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 me-2" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.admin.users')}
        description={t('admin.users.description', { count: mockAllUsers.length })}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.users.addUser')}
          </Button>
        }
      />

      <DataTable
        table={table}
        columns={columns}
        selectable
        searchPlaceholder={t('admin.users.searchPlaceholder')}
        emptyMessage={t('admin.users.noUsers')}
      />
    </div>
  );
}
