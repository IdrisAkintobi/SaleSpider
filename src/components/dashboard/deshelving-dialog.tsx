'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { useDeshelvingMutation } from '@/hooks/use-deshelving-mutations'
import { DeshelvingReason } from '@prisma/client'
import { Package, AlertTriangle } from 'lucide-react'
import { z } from 'zod'

const deshelvingReasons = [
  { value: 'DAMAGED', label: 'Damaged', icon: '🔧' },
  { value: 'RETURNED', label: 'Returned', icon: '↩️' },
  { value: 'EXPIRED', label: 'Expired', icon: '📅' },
  { value: 'RESERVED', label: 'Reserved', icon: '🔒' },
  { value: 'STOLEN', label: 'Stolen', icon: '🚨' },
  { value: 'LOST', label: 'Lost', icon: '❓' },
  { value: 'QUALITY_CONTROL', label: 'Quality Control', icon: '🔍' },
  { value: 'RECALL', label: 'Recall', icon: '⚠️' },
  { value: 'TRANSFER', label: 'Transfer', icon: '📦' },
  { value: 'OTHER', label: 'Other', icon: '📝' },
] as const

const deshelvingSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.nativeEnum(DeshelvingReason, {
    required_error: 'Please select a reason',
  }),
  description: z.string().optional(),
})

type DeshelvingFormData = z.infer<typeof deshelvingSchema>

interface Product {
  readonly id: string
  readonly name: string
  readonly quantity: number
  readonly price: number
}

interface DeshelvingDialogProps {
  readonly product: Product
  readonly trigger?: React.ReactNode
  readonly onSuccess?: () => void
}

export function DeshelvingDialog({
  product,
  trigger,
  onSuccess,
}: DeshelvingDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<DeshelvingFormData>({
    resolver: zodResolver(deshelvingSchema),
    defaultValues: {
      quantity: 1,
      reason: undefined,
      description: '',
    },
  })

  // Use TanStack Query mutation for deshelving
  const deshelvingMutation = useDeshelvingMutation()

  const onSubmit = async (data: DeshelvingFormData) => {
    deshelvingMutation.mutate(
      { productId: product.id, data },
      {
        onSuccess: () => {
          toast({
            title: 'Product Deshelved',
            description: `Successfully deshelved ${data.quantity} units of ${product.name}`,
          })
          setOpen(false)
          form.reset()
          onSuccess?.()
        },
        onError: error => {
          toast({
            title: 'Error',
            description:
              error instanceof Error
                ? error.message
                : 'Failed to deshelve product',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const selectedReason = form.watch('reason')
  const selectedQuantity = form.watch('quantity')
  const estimatedValue = selectedQuantity * product.price

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4 mr-2" />
            Deshelve
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Deshelve Product
          </DialogTitle>
          <DialogDescription>
            Remove units of <strong>{product.name}</strong> from available
            inventory. Current stock: <strong>{product.quantity} units</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Deshelve</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={field.value ?? ''}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      onChange={e => {
                        const value = e.target.value
                        field.onChange(
                          value === '' ? '' : Number.parseInt(value, 10) || 1
                        )
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum available: {product.quantity} units
                    {estimatedValue > 0 && (
                      <span className="block text-sm font-medium text-orange-600 mt-1">
                        Estimated value impact: ${estimatedValue.toFixed(2)}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Deshelving</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deshelvingReasons.map(reason => (
                        <SelectItem key={reason.value} value={reason.value}>
                          <div className="flex items-center gap-2">
                            <span>{reason.icon}</span>
                            <span>{reason.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{' '}
                    <span className="text-muted-foreground ml-1">
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the deshelving..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional context for this deshelving action
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedReason && (
              <div className="rounded-md bg-orange-50 dark:bg-orange-950/20 p-3 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                      Deshelving Confirmation
                    </p>
                    <p className="text-orange-700 dark:text-orange-300 mt-1">
                      This action will remove {selectedQuantity || 0} units from
                      available inventory. This action is logged for audit
                      purposes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={deshelvingMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={deshelvingMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {deshelvingMutation.isPending
                  ? 'Deshelving...'
                  : 'Confirm Deshelve'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
