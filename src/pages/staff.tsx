import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Calendar,
  Check,
  X,
  CalendarOff,
  User,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSalonGet, useSalonPost } from '@/hooks/useSalonData';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import type { User as UserType, StaffSchedule, StaffTimeOff, DayOfWeek, TimeOffType, TimeOffStatus } from '@/types/entities';

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TIME_OFF_TYPES: TimeOffType[] = ['vacation', 'sick_leave', 'personal', 'maternity', 'paternity', 'bereavement', 'unpaid', 'other'];

interface CreateScheduleDto {
  staffId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isWorking: boolean;
}

interface CreateTimeOffDto {
  staffId: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  reason?: string;
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
}

export function StaffPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'schedules' | 'timeoff'>('schedules');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<StaffSchedule | null>(null);

  // Fetch data
  const { data: staffMembers = [] } = useSalonGet<UserType[]>('users');
  const { data: schedules = [] } = useSalonGet<StaffSchedule[]>('staff-schedules');
  const { data: timeOffRequests = [] } = useSalonGet<StaffTimeOff[]>('staff-time-off');

  // Mutations
  const createSchedule = useSalonPost<StaffSchedule, CreateScheduleDto>('staff-schedules', {
    onSuccess: () => {
      toast.success(t('staff.scheduleUpdated'));
      setIsScheduleModalOpen(false);
    },
    onError: (error) => toast.error(error.message || t('common.error')),
  });

  const createTimeOff = useSalonPost<StaffTimeOff, CreateTimeOffDto>('staff-time-off', {
    onSuccess: () => {
      toast.success(t('staff.timeOffRequested'));
      setIsTimeOffModalOpen(false);
    },
    onError: (error) => toast.error(error.message || t('common.error')),
  });

  const approveTimeOff = useSalonPost<StaffTimeOff, { status: TimeOffStatus }>('staff-time-off', {
    method: 'PATCH',
    onSuccess: () => toast.success(t('staff.timeOffApproved')),
    onError: (error) => toast.error(error.message),
  });

  const filteredTimeOff = selectedStaff
    ? timeOffRequests.filter(t => t.staffId === selectedStaff)
    : timeOffRequests;

  const getStaffScheduleForDay = (staffId: string, day: DayOfWeek) => {
    return schedules.find(s => s.staffId === staffId && s.dayOfWeek === day);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.staff')}
        description={t('staff.description')}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsTimeOffModalOpen(true)}>
              <CalendarOff className="h-4 w-4 me-2" />
              {t('staff.requestTimeOff')}
            </Button>
            <Button onClick={() => setIsScheduleModalOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              {t('staff.addSchedule')}
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={cn(
            'px-4 py-2 -mb-px border-b-2 transition-colors',
            activeTab === 'schedules'
              ? 'border-accent-pink text-accent-pink'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('schedules')}
        >
          <Calendar className="h-4 w-4 inline-block me-2" />
          {t('staff.schedules')}
        </button>
        <button
          className={cn(
            'px-4 py-2 -mb-px border-b-2 transition-colors',
            activeTab === 'timeoff'
              ? 'border-accent-pink text-accent-pink'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('timeoff')}
        >
          <CalendarOff className="h-4 w-4 inline-block me-2" />
          {t('staff.timeOff')}
          {timeOffRequests.filter(r => r.status === 'pending').length > 0 && (
            <Badge variant="warning" className="ms-2">
              {timeOffRequests.filter(r => r.status === 'pending').length}
            </Badge>
          )}
        </button>
      </div>

      {/* Staff Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedStaff === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStaff(null)}
        >
          {t('common.all')}
        </Button>
        {staffMembers.map((staff) => (
          <Button
            key={staff.id}
            variant={selectedStaff === staff.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStaff(staff.id)}
            className="gap-2"
          >
            {staff.picture ? (
              <img src={staff.picture} alt={staff.firstName} className="h-5 w-5 rounded-full" />
            ) : (
              <User className="h-4 w-4" />
            )}
            {staff.firstName} {staff.lastName}
          </Button>
        ))}
      </div>

      {activeTab === 'schedules' ? (
        <SchedulesView
          staffMembers={staffMembers}
          selectedStaff={selectedStaff}
          getStaffScheduleForDay={getStaffScheduleForDay}
          onEditSchedule={(schedule) => {
            setEditingSchedule(schedule);
            setIsScheduleModalOpen(true);
          }}
          t={t}
        />
      ) : (
        <TimeOffView
          timeOffRequests={filteredTimeOff}
          staffMembers={staffMembers}
          onApprove={() => approveTimeOff.mutate({ status: 'approved' })}
          onReject={() => approveTimeOff.mutate({ status: 'rejected' })}
          t={t}
        />
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        staffMembers={staffMembers}
        onSubmit={(data) => createSchedule.mutate(data)}
        isLoading={createSchedule.isPending}
        editingSchedule={editingSchedule}
        t={t}
      />

      {/* Time Off Modal */}
      <TimeOffModal
        isOpen={isTimeOffModalOpen}
        onClose={() => setIsTimeOffModalOpen(false)}
        staffMembers={staffMembers}
        onSubmit={(data) => createTimeOff.mutate(data)}
        isLoading={createTimeOff.isPending}
        t={t}
      />
    </div>
  );
}

// ============================================
// SCHEDULES VIEW
// ============================================

interface SchedulesViewProps {
  staffMembers: UserType[];
  selectedStaff: string | null;
  getStaffScheduleForDay: (staffId: string, day: DayOfWeek) => StaffSchedule | undefined;
  onEditSchedule: (schedule: StaffSchedule) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

function SchedulesView({ staffMembers, selectedStaff, getStaffScheduleForDay, onEditSchedule, t }: SchedulesViewProps) {
  const displayStaff = selectedStaff ? staffMembers.filter(s => s.id === selectedStaff) : staffMembers;

  if (displayStaff.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">{t('staff.noStaff')}</h3>
        <p className="text-muted-foreground">{t('staff.noStaffDescription')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {displayStaff.map((staff) => (
        <Card key={staff.id} className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
            {staff.picture ? (
              <img src={staff.picture} alt={staff.firstName} className="h-10 w-10 rounded-full" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-accent-pink/20 flex items-center justify-center">
                <span className="font-semibold text-accent-pink">
                  {staff.firstName?.[0]}{staff.lastName?.[0]}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold">{staff.firstName} {staff.lastName}</h3>
              <p className="text-sm text-muted-foreground">{staff.email}</p>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const schedule = getStaffScheduleForDay(staff.id, day);
                return (
                  <div
                    key={day}
                    className={cn(
                      'p-3 rounded-lg border text-center cursor-pointer transition-colors hover:border-accent-pink',
                      schedule?.isWorking ? 'bg-green-50 border-green-200' : 'bg-muted/50'
                    )}
                    onClick={() => schedule && onEditSchedule(schedule)}
                  >
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                      {t(`days.${day}`)}
                    </p>
                    {schedule?.isWorking ? (
                      <>
                        <p className="text-sm font-semibold text-green-700">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                        {schedule.breakStartTime && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('staff.break')}: {schedule.breakStartTime} - {schedule.breakEndTime}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('staff.dayOff')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// TIME OFF VIEW
// ============================================

interface TimeOffViewProps {
  timeOffRequests: StaffTimeOff[];
  staffMembers: UserType[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

function TimeOffView({ timeOffRequests, staffMembers, onApprove, onReject, t }: TimeOffViewProps) {
  const getStaffName = (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';
  };

  const getStatusBadge = (status: TimeOffStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">{t('staff.pending')}</Badge>;
      case 'approved':
        return <Badge variant="success">{t('staff.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="error">{t('staff.rejected')}</Badge>;
      case 'cancelled':
        return <Badge variant="default">{t('staff.cancelled')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (timeOffRequests.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CalendarOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">{t('staff.noTimeOffRequests')}</h3>
        <p className="text-muted-foreground">{t('staff.noTimeOffRequestsDescription')}</p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('fields.staff')}</TableHead>
            <TableHead>{t('fields.type')}</TableHead>
            <TableHead>{t('fields.dates')}</TableHead>
            <TableHead>{t('fields.reason')}</TableHead>
            <TableHead>{t('fields.status')}</TableHead>
            <TableHead className="text-end">{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeOffRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{getStaffName(request.staffId)}</TableCell>
              <TableCell>{t(`staff.timeOffTypes.${request.type}`)}</TableCell>
              <TableCell>
                {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                {request.isHalfDay && (
                  <span className="text-xs text-muted-foreground ms-1">
                    ({t(`staff.${request.halfDayPeriod}`)})
                  </span>
                )}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{request.reason || '-'}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell className="text-end">
                {request.status === 'pending' && (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => onApprove(request.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onReject(request.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

// ============================================
// SCHEDULE MODAL
// ============================================

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMembers: UserType[];
  onSubmit: (data: CreateScheduleDto) => void;
  isLoading: boolean;
  editingSchedule: StaffSchedule | null;
  t: ReturnType<typeof useTranslation>['t'];
}

function ScheduleModal({ isOpen, onClose, staffMembers, onSubmit, isLoading, editingSchedule, t }: ScheduleModalProps) {
  const [formData, setFormData] = useState<CreateScheduleDto>({
    staffId: '',
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '18:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    isWorking: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingSchedule ? t('staff.editSchedule') : t('staff.addSchedule')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('fields.staff')}</Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) => setFormData({ ...formData, staffId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('staff.selectStaff')} />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('fields.day')}</Label>
              <Select
                value={formData.dayOfWeek}
                onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value as DayOfWeek })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {t(`days.${day}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>{t('staff.isWorking')}</Label>
              <Switch
                checked={formData.isWorking}
                onCheckedChange={(checked) => setFormData({ ...formData, isWorking: checked })}
              />
            </div>

            {formData.isWorking && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.startTime')}</Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('fields.endTime')}</Label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('staff.breakStart')}</Label>
                    <Input
                      type="time"
                      value={formData.breakStartTime || ''}
                      onChange={(e) => setFormData({ ...formData, breakStartTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('staff.breakEnd')}</Label>
                    <Input
                      type="time"
                      value={formData.breakEndTime || ''}
                      onChange={(e) => setFormData({ ...formData, breakEndTime: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// TIME OFF MODAL
// ============================================

interface TimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMembers: UserType[];
  onSubmit: (data: CreateTimeOffDto) => void;
  isLoading: boolean;
  t: ReturnType<typeof useTranslation>['t'];
}

function TimeOffModal({ isOpen, onClose, staffMembers, onSubmit, isLoading, t }: TimeOffModalProps) {
  const [formData, setFormData] = useState<CreateTimeOffDto>({
    staffId: '',
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDayPeriod: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('staff.requestTimeOff')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('fields.staff')}</Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) => setFormData({ ...formData, staffId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('staff.selectStaff')} />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('fields.type')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as TimeOffType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OFF_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`staff.timeOffTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('fields.startDate')}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('fields.endDate')}</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>{t('staff.halfDay')}</Label>
              <Switch
                checked={formData.isHalfDay}
                onCheckedChange={(checked) => setFormData({ ...formData, isHalfDay: checked })}
              />
            </div>

            {formData.isHalfDay && (
              <div className="space-y-2">
                <Label>{t('staff.period')}</Label>
                <Select
                  value={formData.halfDayPeriod || ''}
                  onValueChange={(value) => setFormData({ ...formData, halfDayPeriod: value as 'morning' | 'afternoon' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('staff.selectPeriod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">{t('staff.morning')}</SelectItem>
                    <SelectItem value="afternoon">{t('staff.afternoon')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('fields.reason')}</Label>
              <Textarea
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                placeholder={t('staff.reasonPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('staff.submitRequest')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
