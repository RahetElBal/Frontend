import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Shield, Users } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/badge';
import { Card } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/table/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTable } from '@/hooks/useTable';
import { UserRole } from '@/types/entities';

// TODO: Replace with real API data
const users: AdminUser[] = [];

type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  salonName: string | null;
  createdAt: string;
};

export function AdminUsersPage() {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as UserRole,
  });

  const table = useTable<AdminUser>({
    data: users,
    searchKeys: ['firstName', 'lastName', 'email', 'salonName'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to create user
    console.log('Creating user:', formData);
    setIsAddModalOpen(false);
    setFormData({ firstName: '', lastName: '', email: '', role: 'user' as UserRole });
  };

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
      render: (_user) => (
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
        description={t('admin.users.description', { count: users.length })}
        actions={
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('admin.users.addUser')}
          </Button>
        }
      />

      {users.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('admin.users.noUsers')}</h3>
          <p className="text-muted-foreground mb-4">Aucun utilisateur pour le moment</p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {t('admin.users.addUser')}
          </Button>
        </Card>
      ) : (
        <DataTable
          table={table}
          columns={columns}
          selectable
          searchPlaceholder={t('admin.users.searchPlaceholder')}
          emptyMessage={t('admin.users.noUsers')}
        />
      )}

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('admin.users.addUser')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('fields.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('fields.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t('fields.role')}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: string) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
