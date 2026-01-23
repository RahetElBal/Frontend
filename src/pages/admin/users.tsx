import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Shield, Users, Building2 } from 'lucide-react';

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
import { useGet } from '@/hooks/useGet';
import { usePost } from '@/hooks/usePost';
import { toast } from '@/lib/toast';
import { UserRole } from '@/types/entities';
import type { User, Salon } from '@/types/entities';

// Paginated response type from backend
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

interface CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
  salonId: string;
}

export function AdminUsersPage() {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    role: 'user' as UserRole,
    salonId: '',
  });

  // Fetch users from API (paginated response)
  const { data: usersResponse, isLoading } = useGet<PaginatedResponse<User>>('users');
  const users = usersResponse?.data || [];

  // Fetch all salons for selection (returns array directly)
  const { data: salons = [] } = useGet<Salon[]>('salons');

  // Create user mutation
  const createUser = usePost<User, CreateUserDto>('users', {
    onSuccess: () => {
      toast.success(t('admin.users.addUser') + ' - ' + t('common.success'));
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', role: 'user' as UserRole, salonId: '' });
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  const table = useTable<User>({
    data: users,
    searchKeys: ['name', 'email'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(formData);
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
      render: (user) => {
        // Handle both name formats (name or firstName/lastName)
        const displayName = (user as any).name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
        const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
        
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-pink/10 flex items-center justify-center">
              {user.picture ? (
                <img src={user.picture} alt={displayName} className="h-10 w-10 rounded-full" />
              ) : (
                <span className="font-medium text-accent-pink">
                  {initials}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'salon',
      header: t('fields.salon'),
      render: (user) => (
        <div className="flex items-center gap-2">
          {user.salon ? (
            <>
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{user.salon.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
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

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
      ) : users.length === 0 ? (
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
              <div className="space-y-2">
                <Label htmlFor="name">{t('fields.fullName')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jean Dupont"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('fields.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jean@example.com"
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
              <div className="space-y-2">
                <Label htmlFor="salon">{t('fields.salon')} *</Label>
                <Select
                  value={formData.salonId}
                  onValueChange={(value: string) => setFormData({ ...formData, salonId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un salon" />
                  </SelectTrigger>
                  <SelectContent>
                    {salons.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        Aucun salon disponible
                      </div>
                    ) : (
                      salons.map((salon) => (
                        <SelectItem key={salon.id} value={salon.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {salon.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  L'utilisateur aura accès uniquement à ce salon
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
