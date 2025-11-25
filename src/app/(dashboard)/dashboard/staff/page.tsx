'use client'

import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

import { useStaff, useUpdateUserStatus } from '@/hooks/use-staff'
import type { User, Role, UserStatus } from '@/lib/types'
import { ArrowUp, ArrowDown, Pencil, Unlock } from 'lucide-react'
import { SearchInput } from '@/components/shared/search-input'
import React, { useMemo, useState } from 'react'
import { AddStaffDialog } from './add-staff-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTableControls } from '@/hooks/use-table-controls'
import { GenericTable } from '@/components/ui/generic-table'
import { StaffTableSkeleton } from '@/components/dashboard/staff/staff-table-skeleton'
import { useTranslation } from '@/lib/i18n'
import { useIsAccountLocked, useUnlockAccount } from '@/hooks/use-rate-limit'
import { fetchJson } from '@/lib/fetch-utils'

// Permission check helpers
function canEditStaff(
  currentUserRole: Role | undefined,
  targetStaffRole: Role
): boolean {
  if (currentUserRole === 'SUPER_ADMIN') return true
  if (currentUserRole === 'MANAGER' && targetStaffRole === 'CASHIER')
    return true
  return false
}

// Staff Actions Component
function StaffActions({
  staff,
  canEdit,
  onEdit,
}: Readonly<{
  staff: User
  canEdit: boolean
  onEdit: () => void
}>) {
  const t = useTranslation()
  const { toast } = useToast()
  const isLocked = useIsAccountLocked(staff.email)
  const unlockAccount = useUnlockAccount()

  const handleUnlock = async () => {
    try {
      await unlockAccount.mutateAsync(staff.email)
      toast({
        title: t('success'),
        description: `Account unlocked for ${staff.name}`,
      })
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : 'Failed to unlock account',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="text-right space-x-2">
      {isLocked && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnlock}
          disabled={unlockAccount.isPending}
        >
          <Unlock className="mr-2 h-3 w-3" />
          {unlockAccount.isPending ? t('unlocking') : t('unlock')}
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={onEdit} disabled={!canEdit}>
        <Pencil className="mr-2 h-3 w-3" /> {t('edit')}
      </Button>
    </div>
  )
}

// API function
async function editUser(update: Partial<User> & { id: string }) {
  return fetchJson('/api/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  })
}

// Form data extraction helper
function extractFormUpdate(
  formData: FormData,
  staffId: string,
  currentUserRole: Role | undefined,
  targetStaffRole: Role
): Partial<User> & { id: string } {
  const update: Partial<User> & { id: string } = { id: staffId }

  if (!canEditStaff(currentUserRole, targetStaffRole)) {
    return update
  }

  const name = formData.get('name')
  if (typeof name === 'string') update.name = name

  const username = formData.get('username')
  if (typeof username === 'string') update.username = username

  const email = formData.get('email')
  if (typeof email === 'string') update.email = email

  const role = formData.get('role')
  if (typeof role === 'string') update.role = role as Role

  return update
}

// Cell renderer helper
function renderStaffCell(
  staff: User,
  columnKey: string,
  canEdit: boolean,
  userIsManager: boolean,
  t: (key: string) => string,
  handleStatusChange: (staff: User, checked: boolean) => void,
  setEditStaff: (staff: User) => void
): React.ReactNode {
  switch (columnKey) {
    case 'name':
      return <span className="font-medium">{staff.name}</span>
    case 'username':
      return staff.username
    case 'role':
      return (
        <Badge variant={userIsManager ? 'default' : 'secondary'}>
          {t(staff.role.toLowerCase())}
        </Badge>
      )
    case 'status':
      return (
        <>
          <Switch
            checked={staff.status === 'ACTIVE'}
            onCheckedChange={checked => handleStatusChange(staff, checked)}
            disabled={!canEdit}
          />
          <span className="ml-2">
            {t(staff.status === 'ACTIVE' ? 'active' : 'inactive')}
          </span>
        </>
      )
    case 'actions':
      return (
        <StaffActions
          staff={staff}
          canEdit={canEdit}
          onEdit={() => setEditStaff(staff)}
        />
      )
    default:
      return null
  }
}

// Filter staff helper
function filterStaffBySearch(staff: User, searchTerm: string): boolean {
  const lowerSearch = searchTerm.toLowerCase()
  return (
    staff.name.toLowerCase().includes(lowerSearch) ||
    staff.username?.toLowerCase().includes(lowerSearch) ||
    staff.role.toLowerCase().includes(lowerSearch)
  )
}

// Sort icon helper
function SortIcon({
  isActive,
  order,
}: {
  isActive: boolean
  order: 'asc' | 'desc'
}) {
  if (!isActive) return null
  return order === 'asc' ? (
    <ArrowUp className="inline w-3 h-3" aria-hidden="true" />
  ) : (
    <ArrowDown className="inline w-3 h-3" aria-hidden="true" />
  )
}

// Sortable column header helper
function createSortableHeader(
  label: string,
  columnKey: string,
  currentSort: string,
  order: 'asc' | 'desc',
  handleSort: (key: string) => void,
  ariaLabel?: string
) {
  return (
    <button
      type="button"
      className="cursor-pointer hover:underline focus:outline-none focus:underline"
      onClick={() => handleSort(columnKey)}
      aria-label={ariaLabel || `Sort by ${columnKey}`}
    >
      {label} <SortIcon isActive={currentSort === columnKey} order={order} />
    </button>
  )
}

export default function StaffPage() {
  const { user: currentUser, userIsManager } = useAuth()
  const { toast } = useToast()
  const t = useTranslation()

  // Use shared table controls
  const {
    page,
    pageSize,
    sort,
    order,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
  } = useTableControls({ initialSort: 'name', initialOrder: 'asc' })

  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editStaff, setEditStaff] = useState<User | null>(null)

  // Use custom hooks for data fetching
  const { data, isLoading: isLoadingUsers } = useStaff(
    {
      page,
      pageSize,
      sort,
      order,
      searchTerm,
    },
    userIsManager
  )
  const users = useMemo(() => data?.data ?? [], [data])
  const total = data?.total || 0
  const updateStatusMutation = useUpdateUserStatus()

  // Use users directly as staff list (no need for sales data)
  const staffList: User[] = users

  const isLoading = isLoadingUsers

  const handleStatusChange = (staffMember: User, newStatus: boolean) => {
    const status: UserStatus = newStatus ? 'ACTIVE' : 'INACTIVE'

    // Use the mutation with toast handling
    updateStatusMutation.mutate(
      { userId: staffMember.id, status },
      {
        onSuccess: updatedUser => {
          toast({
            title: 'Status Updated',
            description: `${updatedUser.name}'s status changed to ${updatedUser.status}.`,
          })
        },
        onError: error => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to update status',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const filteredStaff = useMemo(
    () =>
      staffList
        .filter(staff => {
          // Managers should only see cashiers
          if (currentUser?.role === 'MANAGER' && staff.role !== 'CASHIER') {
            return false
          }
          return filterStaffBySearch(staff, searchTerm)
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [staffList, searchTerm, currentUser?.role]
  )

  // Replace the editMutation definition inside the component with:
  const queryClient = useQueryClient()
  const editMutation = useMutation({
    mutationFn: editUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })

  // Check if user has permission to view staff
  if (
    !currentUser ||
    (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'MANAGER')
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold mb-2">{t('access_denied')}</h2>
        <p className="text-muted-foreground">{t('super_admin_only')}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <>
        <PageHeader
          title={t('staff_management')}
          description={t('staff_management_description')}
        />
        <div className="mb-4 max-w-sm">
          <SearchInput
            placeholder="Search staff by name, username, or role..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <StaffTableSkeleton />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={t('staff_management')}
        description={t('staff_management_description')}
        actions={
          userIsManager && (
            <AddStaffDialog
              isOpen={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              onStaffAdded={() => {}}
            />
          )
        }
      />
      <div className="mb-4 max-w-sm">
        <SearchInput
          placeholderKey="search_staff"
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <GenericTable
            columns={[
              {
                key: 'name',
                label: createSortableHeader(
                  t('name'),
                  'name',
                  sort,
                  order,
                  handleSort
                ),
                sortable: true,
                onSort: () => handleSort('name'),
              },
              {
                key: 'username',
                label: createSortableHeader(
                  t('username'),
                  'username',
                  sort,
                  order,
                  handleSort
                ),
                sortable: true,
                onSort: () => handleSort('username'),
              },
              {
                key: 'role',
                label: createSortableHeader(
                  t('role'),
                  'role',
                  sort,
                  order,
                  handleSort,
                  t('sort_by_role')
                ),
                sortable: true,
                onSort: () => handleSort('role'),
              },
              {
                key: 'status',
                label: createSortableHeader(
                  t('status'),
                  'status',
                  sort,
                  order,
                  handleSort,
                  t('sort_by_status')
                ),
                sortable: true,
                onSort: () => handleSort('status'),
              },
              {
                key: 'actions',
                label: <span className="text-right">{t('actions')}</span>,
                align: 'right',
              },
            ]}
            data={filteredStaff}
            rowKey={row => row.id}
            renderCell={(staff, col) => {
              const canEdit = canEditStaff(currentUser?.role, staff.role)
              return renderStaffCell(
                staff,
                col.key,
                canEdit,
                userIsManager,
                t,
                handleStatusChange,
                setEditStaff
              )
            }}
            emptyMessage={t('no_staff_found')}
            paginationProps={{
              page,
              pageSize,
              total,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }}
          />
        </CardContent>
      </Card>
      {editStaff && (
        <Dialog
          open={!!editStaff}
          onOpenChange={open => setEditStaff(open ? editStaff : null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('edit_staff') + ': ' + editStaff?.name}
              </DialogTitle>
              <DialogDescription>{t('update_staff_details')}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const update = extractFormUpdate(
                  formData,
                  editStaff.id,
                  currentUser?.role,
                  editStaff.role
                )

                editMutation.mutate(update, {
                  onSuccess: () => {
                    toast({ title: 'Staff updated' })
                    setEditStaff(null)
                  },
                  onError: (error: unknown) => {
                    toast({
                      title: 'Error',
                      description:
                        error instanceof Error ? error.message : String(error),
                      variant: 'destructive',
                    })
                  },
                })
              }}
              className="space-y-4"
            >
              <Input
                name="name"
                defaultValue={editStaff.name}
                placeholder="Name"
                required
                disabled={!canEditStaff(currentUser?.role, editStaff.role)}
              />
              <Input
                name="username"
                defaultValue={editStaff.username}
                placeholder="Username"
                required
                disabled={!canEditStaff(currentUser?.role, editStaff.role)}
              />
              <Input
                name="email"
                type="email"
                defaultValue={editStaff.email}
                placeholder="Email"
                required
                disabled={!canEditStaff(currentUser?.role, editStaff.role)}
              />
              <Select
                name="role"
                value={editStaff.role}
                onValueChange={value => {
                  setEditStaff(editStaff =>
                    editStaff
                      ? { ...editStaff, role: value as Role }
                      : editStaff
                  )
                }}
                disabled={!canEditStaff(currentUser?.role, editStaff.role)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASHIER">Cashier</SelectItem>
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditStaff(null)}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={editMutation.isPending}
                >
                  {editMutation.isPending ? t('saving') : t('save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
