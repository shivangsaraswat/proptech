import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTicket } from '@/hooks/queries/use-tickets';
import { useAuthStore } from '@/stores/auth-store';
import type { TicketPriority } from '@/types';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Create New Ticket
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Report a maintenance issue
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
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
              <p className="text-xs text-red-600">{errors.title.message}</p>
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
              className="min-h-[100px]"
              disabled={isPending}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label>
              Priority <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-300', activeColor: 'bg-gray-600 text-white border-gray-600' },
                  { value: 'medium', label: 'Medium', color: 'bg-yellow-50 text-yellow-700 border-yellow-300', activeColor: 'bg-yellow-500 text-white border-yellow-500' },
                  { value: 'high', label: 'High', color: 'bg-orange-50 text-orange-700 border-orange-300', activeColor: 'bg-orange-500 text-white border-orange-500' },
                  { value: 'urgent', label: 'Urgent', color: 'bg-red-50 text-red-700 border-red-300', activeColor: 'bg-red-600 text-white border-red-600' },
                ] as const
              ).map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                    priority === p.value ? p.activeColor : p.color
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Number & Building - side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="unitNumber">Unit Number</Label>
              <Input
                id="unitNumber"
                placeholder="e.g., Apt 3B"
                className="h-10"
                disabled={isPending}
                {...register('unitNumber')}
              />
              {errors.unitNumber && (
                <p className="text-xs text-red-600">
                  {errors.unitNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="building">Building</Label>
              <Input
                id="building"
                placeholder="e.g., Sunrise Towers"
                className="h-10"
                disabled={isPending}
                {...register('building')}
              />
              {errors.building && (
                <p className="text-xs text-red-600">
                  {errors.building.message}
                </p>
              )}
            </div>
          </div>

          {/* Logged in as info */}
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                Submitting as {user?.role}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Ticket'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
