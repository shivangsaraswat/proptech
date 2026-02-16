import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Building03Icon,
  Cancel01Icon,
  Location01Icon
} from '@hugeicons/core-free-icons';
import type { TicketPriority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTicket } from '@/hooks/queries/use-tickets';
import { useAuthStore } from '@/stores/auth-store';

const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description is too long'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  unitNumber: z.string().max(50).optional(),
  building: z.string().max(255).optional(),
});

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

interface CreateTicketDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTicketDialog({ open, onClose }: CreateTicketDialogProps) {
  const { user } = useAuthStore();
  const { mutateAsync: createTicket, isPending } = useCreateTicket();
  const [priority, setPriority] = useState<TicketPriority>('medium');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const onSubmit = async (data: CreateTicketFormData) => {
    try {
      await createTicket({ ...data, priority });
      toast.success('Ticket created successfully!');
      reset();
      setPriority('medium');
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create ticket'
      );
    }
  };

  const handleClose = () => {
    if (!isPending) {
      reset();
      setPriority('medium');
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-card rounded-xl shadow-lg w-full max-w-lg border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Create New Ticket
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Report a maintenance issue
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isPending}
            className="h-8 w-8 rounded-full"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Leaking faucet in kitchen"
              className="h-10"
              disabled={isPending}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              className="min-h-[100px] resize-none"
              disabled={isPending}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>
              Priority <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: 'low', label: 'Low', class: 'bg-slate-100 text-slate-700 hover:bg-slate-200', active: 'bg-slate-600 text-white ring-2 ring-slate-600 ring-offset-1' },
                  { value: 'medium', label: 'Medium', class: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100', active: 'bg-yellow-500 text-white ring-2 ring-yellow-500 ring-offset-1' },
                  { value: 'high', label: 'High', class: 'bg-orange-50 text-orange-700 hover:bg-orange-100', active: 'bg-orange-500 text-white ring-2 ring-orange-500 ring-offset-1' },
                  { value: 'urgent', label: 'Urgent', class: 'bg-red-50 text-red-700 hover:bg-red-100', active: 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-1' },
                ] as const
              ).map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`
                     px-4 py-2 text-xs font-medium rounded-md transition-all border border-transparent
                     ${priority === p.value ? p.active : p.class}
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Number & Building - side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="unitNumber" className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Location01Icon} className="h-3.5 w-3.5 text-muted-foreground" />
                Unit Number
              </Label>
              <Input
                id="unitNumber"
                placeholder="e.g., Apt 3B"
                className="h-10"
                disabled={isPending}
                {...register('unitNumber')}
              />
              {errors.unitNumber && (
                <p className="text-xs text-red-500">
                  {errors.unitNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="building" className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Building03Icon} className="h-3.5 w-3.5 text-muted-foreground" />
                Building
              </Label>
              <Input
                id="building"
                placeholder="e.g., Sunrise Towers"
                className="h-10"
                disabled={isPending}
                {...register('building')}
              />
              {errors.building && (
                <p className="text-xs text-red-500">
                  {errors.building.message}
                </p>
              )}
            </div>
          </div>

          {/* Logged in as info */}
          <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3 border border-border/50">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold border border-primary/10">
              {user?.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                Submitting as {user?.role}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? (
                <>Created...</>
              ) : (
                <span className="flex items-center gap-2">
                  <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
                  Create Ticket
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
