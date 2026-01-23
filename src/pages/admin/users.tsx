import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Shield, Users, Building2, Mail, Calendar, Crown, ToggleLeft, ToggleRight } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/badge';
import { Card } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/table/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

// Superadmin email - cannot be deleted or modified
const SUPERADMIN_EMAIL = 'sofianelaghouatipro@gmail.com';

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

interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
  salonId?: string;
  isActive?: boolean;
}

export function AdminUsersPage() {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    role: 'user' as UserRole,
    salonId: '',
  });

  const [editFormData, setEditFormData] = useState<UpdateUserDto>({
    name: '',
    email: '',
    role: 'user' as UserRole,
    salonId: '',
  });

  // Fetch users from API (paginated response)
  const { data: usersResponse, isLoading, refetch } = useGet<PaginatedResponse<User>>('users');
  const users = usersResponse?.data || [];

  // Fetch all salons for selection (returns array directly)
  const { data: salons = [] } = useGet<Salon[]>('salons');

  // Create user mutation
  const createUser = usePost<User, CreateUserDto>('users', {
    onSuccess: () => {
      toast.success(t('admin.users.addUser') + ' - ' + t('common.success'));
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', role: 'user' as UserRole, salonId: '' });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  // Update user mutation
  const updateUser = usePost<User, UpdateUserDto>('users', {
    id: selectedUser?.id,
    method: 'PATCH',
    onSuccess: () => {
      toast.success(t('common.edit') + ' - ' + t('common.success'));
      setIsEditModalOpen(false);
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  // Delete user mutation
  const deleteUser = usePost<void, void>('users', {
    id: selectedUser?.id,
    method: 'DELETE',
    onSuccess: () => {
      toast.success(t('common.delete') + ' - ' + t('common.success'));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  // Toggle user status mutation
  const toggleStatus = usePost<User, void>('users', {
    id: (selectedUser?.id ? `${selectedUser.id}/toggle-status` : ''),
    method: 'PATCH',
    onSuccess: () => {
      toast.success(t('common.success'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  const table = useTable<User>({
    data: users,
    searchKeys: ['name', 'email'],
  });

  // Check if user is superadmin
  const isSuperAdmin = (user: User) => user.email === SUPERADMIN_EMAIL;

  // Helper to get display name
  const getDisplayName = (user: User) => {
    return (user as any).name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
  };

  // Helper to get initials
  const getInitials = (user: User) => {
    const name = getDisplayName(user);
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user: User) => {
    if (isSuperAdmin(user)) {
      toast.error('Le super-administrateur ne peut pas être modifié');
      return;
    }
    setSelectedUser(user);
    setEditFormData({
      name: getDisplayName(user),
      email: user.email,
      role: user.role,
      salonId: user.salonId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    if (isSuperAdmin(user)) {
      toast.error('Le super-administrateur ne peut pas être supprimé');
      return;
    }
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    if (isSuperAdmin(user)) {
      toast.error('Le statut du super-administrateur ne peut pas être modifié');
      return;
    }
    setSelectedUser(user);
    toggleStatus.mutate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(formData);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateUser.mutate(editFormData);
  };

  const handleConfirmDelete = () => {
    if (!selectedUser || isSuperAdmin(selectedUser)) return;
    deleteUser.mutate();
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
      render: (user) => {
        const displayName = getDisplayName(user);
        const initials = getInitials(user);
        const isSuper = isSuperAdmin(user);
        
        return (
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isSuper ? 'bg-yellow-100' : 'bg-accent-pink/10'}`}>
              {user.picture ? (
                <img src={user.picture} alt={displayName} className="h-10 w-10 rounded-full" />
              ) : (
                <span className={`font-medium ${isSuper ? 'text-yellow-600' : 'text-accent-pink'}`}>
                  {initials}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{displayName}</p>
                {isSuper && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
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
          {user.role === UserRole.ADMIN ? 'Admin' : 'Utilisateur'}
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
      render: (user) => {
        const isSuper = isSuperAdmin(user);
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(user)}>
                <Eye className="h-4 w-4 me-2" />
                {t('common.view')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleEdit(user)}
                disabled={isSuper}
                className={isSuper ? 'opacity-50' : ''}
              >
                <Edit className="h-4 w-4 me-2" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleToggleStatus(user)}
                disabled={isSuper}
                className={isSuper ? 'opacity-50' : ''}
              >
                {user.isActive ? (
                  <>
                    <ToggleLeft className="h-4 w-4 me-2" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <ToggleRight className="h-4 w-4 me-2" />
                    Activer
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDelete(user)}
                disabled={isSuper}
                className={`text-destructive ${isSuper ? 'opacity-50' : ''}`}
              >
                <Trash2 className="h-4 w-4 me-2" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
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

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center ${isSuperAdmin(selectedUser) ? 'bg-yellow-100' : 'bg-accent-pink/10'}`}>
                  {selectedUser.picture ? (
                    <img src={selectedUser.picture} alt={getDisplayName(selectedUser)} className="h-16 w-16 rounded-full" />
                  ) : (
                    <span className={`text-2xl font-bold ${isSuperAdmin(selectedUser) ? 'text-yellow-600' : 'text-accent-pink'}`}>
                      {getInitials(selectedUser)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{getDisplayName(selectedUser)}</h3>
                    {isSuperAdmin(selectedUser) && (
                      <Badge variant="warning" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Super Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.email')}</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.role')}</p>
                    <Badge variant={selectedUser.role === UserRole.ADMIN ? 'info' : 'default'}>
                      {selectedUser.role === UserRole.ADMIN ? 'Administrateur' : 'Utilisateur'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.salon')}</p>
                    <p className="font-medium">{selectedUser.salon?.name || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.createdAt')}</p>
                    <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {selectedUser.isActive ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">{t('fields.status')}</p>
                      <Badge variant={selectedUser.isActive ? 'success' : 'error'}>
                        {selectedUser.isActive ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fermer
            </Button>
            {selectedUser && !isSuperAdmin(selectedUser) && (
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleEdit(selectedUser);
              }}>
                <Edit className="h-4 w-4 me-2" />
                {t('common.edit')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifier les informations de {selectedUser ? getDisplayName(selectedUser) : ''}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t('fields.fullName')} *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">{t('fields.email')} *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">{t('fields.role')}</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value: string) => setEditFormData({ ...editFormData, role: value as UserRole })}
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
                <Label htmlFor="edit-salon">{t('fields.salon')}</Label>
                <Select
                  value={editFormData.salonId}
                  onValueChange={(value: string) => setEditFormData({ ...editFormData, salonId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un salon" />
                  </SelectTrigger>
                  <SelectContent>
                    {salons.map((salon) => (
                      <SelectItem key={salon.id} value={salon.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {salon.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{selectedUser ? getDisplayName(selectedUser) : ''}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? t('common.loading') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
