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
import { useSales } from '@/hooks/use-sales'
import { useStaff, useUpdateUserStatus } from '@/hooks/use-staff'
import { Role, UserStatus } from '@prisma/client'
import type { User, Sale } from '@/lib/types'
import React from 'react'
import { Search, ArrowUp, ArrowDown, Pencil } from 'lucide-react'
import { useMemo, useState } from 'react'
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

interface StaffPerformance extends User {
  totalSalesValue: number
  numberOfSales: number
}

// Add this outside the component
async function editUser(update: Partial<User> & { id: string }) {
  const res = await fetch('/api/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  })
  if (!res.ok)
    throw new Error((await res.json()).message || 'Failed to update user')
  return res.json()
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
  const [editStaff, setEditStaff] = useState<StaffPerformance | null>(null)

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

  // Add after useStaff and before staffList
  const { data: salesData } = useSales()
  const sales = useMemo(() => salesData?.data ?? [], [salesData])

  // Combine users and sales data to create performance data
  const staffList: StaffPerformance[] = useMemo(() => {
    return users.map((user: User) => {
      const userSales = sales.filter((sale: Sale) => sale.cashierId === user.id)
      const totalSalesValue = userSales.reduce(
        (sum: number, sale: Sale) => sum + sale.totalAmount,
        0
      )
      return {
        ...user,
        totalSalesValue,
        numberOfSales: userSales.length,
      }
    })
  }, [users, sales])

  const isLoading = isLoadingUsers

  const handleStatusChange = (
    staffMember: StaffPerformance,
    newStatus: boolean
  ) => {
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
        .filter(
          staff =>
            staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [staffList, searchTerm]
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
        <div className="mb-4">
          <Input
            placeholder="Search staff by name, username, or role..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-sm"
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <StaffTableSkeleton userIsManager={userIsManager} />
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
      <div className="mb-4">
        <Input
          placeholder={t('search_staff')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <GenericTable
            columns={[
              {
                key: 'name',
                label: (
                  <span
                    className="cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    {t('name')}{' '}
                    {sort === 'name' &&
                      (order === 'asc' ? (
                        <ArrowUp className="inline w-3 h-3" />
                      ) : (
                        <ArrowDown className="inline w-3 h-3" />
                      ))}
                  </span>
                ),
                sortable: true,
                onSort: () => handleSort('name'),
              },
              {
                key: 'username',
                label: (
                  <span
                    className="cursor-pointer"
                    onClick={() => handleSort('username')}
                  >
                    {t('username')}{' '}
                    {sort === 'username' &&
                      (order === 'asc' ? (
                        <ArrowUp className="inline w-3 h-3" />
                      ) : (
                        <ArrowDown className="inline w-3 h-3" />
                      ))}
                  </span>
                ),
                sortable: true,
                onSort: () => handleSort('username'),
              },
              {
                key: 'role',
                label: (
                  <span
                    className="cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    {t('role')}{' '}
                    {sort === 'role' &&
                      (order === 'asc' ? (
                        <ArrowUp className="inline w-3 h-3" />
                      ) : (
                        <ArrowDown className="inline w-3 h-3" />
                      ))}
                  </span>
                ),
                sortable: true,
                onSort: () => handleSort('role'),
              },
              { key: 'totalSalesValue', label: t('total_sales') },
              { key: 'numberOfSales', label: t('number_of_orders') },
              {
                key: 'status',
                label: (
                  <span
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    {t('status')}{' '}
                    {sort === 'status' &&
                      (order === 'asc' ? (
                        <ArrowUp className="inline w-3 h-3" />
                      ) : (
                        <ArrowDown className="inline w-3 h-3" />
                      ))}
                  </span>
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
              switch (col.key) {
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
                case 'totalSalesValue':
                  return `$${staff.totalSalesValue.toFixed(2)}`
                case 'numberOfSales':
                  return staff.numberOfSales
                case 'status':
                  return (
                    <>
                      <Switch
                        checked={staff.status === 'ACTIVE'}
                        onCheckedChange={checked =>
                          handleStatusChange(staff, checked)
                        }
                        disabled={
                          currentUser?.role !== 'SUPER_ADMIN' &&
                          (currentUser?.role !== 'MANAGER' ||
                            staff.role !== 'CASHIER')
                        }
                      />
                      <span className="ml-2">
                        {t(staff.status === 'ACTIVE' ? 'active' : 'inactive')}
                      </span>
                    </>
                  )
                case 'actions':
                  return (
                    <div className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditStaff(staff)}
                        disabled={
                          currentUser?.role !== 'SUPER_ADMIN' &&
                          (currentUser?.role !== 'MANAGER' ||
                            staff.role !== 'CASHIER')
                        }
                      >
                        <Pencil className="mr-2 h-3 w-3" /> {t('edit')}
                      </Button>
                    </div>
                  )
                default: {
                  const value = (staff as unknown as Record<string, unknown>)[
                    col.key as string
                  ]
                  if (
                    typeof value === 'string' ||
                    typeof value === 'number' ||
                    typeof value === 'boolean'
                  ) {
                    return String(value)
                  }
                  if (React.isValidElement(value)) {
                    return value
                  }
                  return null
                }
              }
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
              onSubmit={async e => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const formData = new FormData(form)
                const update: Partial<User> & { id: string } = {
                  id: editStaff.id,
                }
                if (
                  currentUser?.role === 'SUPER_ADMIN' ||
                  (currentUser?.role === 'MANAGER' &&
                    editStaff.role === 'CASHIER')
                ) {
                  const name = formData.get('name')
                  if (typeof name === 'string') update.name = name
                  const username = formData.get('username')
                  if (typeof username === 'string') update.username = username
                  const email = formData.get('email')
                  if (typeof email === 'string') update.email = email
                  const role = formData.get('role')
                  if (typeof role === 'string') update.role = role as Role
                }
                editMutation.mutate(update, {
                  onSuccess: () => {
                    toast({ title: 'Staff updated' })
                    setEditStaff(null)
                  },
                  onError: (error: unknown) => {
                    const message =
                      error instanceof Error ? error.message : String(error)
                    toast({
                      title: 'Error',
                      description: message,
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
                disabled={
                  currentUser?.role !== 'SUPER_ADMIN' &&
                  (currentUser?.role !== 'MANAGER' ||
                    editStaff.role !== 'CASHIER')
                }
              />
              <Input
                name="username"
                defaultValue={editStaff.username}
                placeholder="Username"
                required
                disabled={
                  currentUser?.role !== 'SUPER_ADMIN' &&
                  (currentUser?.role !== 'MANAGER' ||
                    editStaff.role !== 'CASHIER')
                }
              />
              <Input
                name="email"
                type="email"
                defaultValue={editStaff.email}
                placeholder="Email"
                required
                disabled={
                  currentUser?.role !== 'SUPER_ADMIN' &&
                  (currentUser?.role !== 'MANAGER' ||
                    editStaff.role !== 'CASHIER')
                }
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
                disabled={
                  currentUser?.role !== 'SUPER_ADMIN' &&
                  (currentUser?.role !== 'MANAGER' ||
                    editStaff.role !== 'CASHIER')
                }
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
