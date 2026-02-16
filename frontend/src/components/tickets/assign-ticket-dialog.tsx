import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAssignTicket } from '@/hooks/queries/use-tickets';
import { useTechnicians } from '@/hooks/queries/use-users';
import type { Ticket, User } from '@/types';

interface AssignTicketDialogProps {
  open: boolean;
  onClose: () => void;
  ticket: Ticket;
}

export function AssignTicketDialog({
  open,
  onClose,
  ticket,
}: AssignTicketDialogProps) {
  const { data: technicians, isLoading } = useTechnicians();
  const { mutateAsync: assignTicket, isPending } = useAssignTicket(ticket.id);
  const [selectedId, setSelectedId] = useState<string | null>(
    ticket.assignedTo || null
  );

  const handleAssign = async () => {
    if (!selectedId) {
      toast.error('Please select a technician');
      return;
    }

    try {
      await assignTicket(selectedId);
      toast.success('Ticket assigned successfully!');
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to assign ticket'
      );
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setSelectedId(ticket.assignedTo || null);
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Assign Ticket
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select a technician for this ticket
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

          {/* Ticket info */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-900 text-sm">{ticket.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  ticket.priority === 'urgent'
                    ? 'bg-red-100 text-red-700'
                    : ticket.priority === 'high'
                      ? 'bg-orange-100 text-orange-700'
                      : ticket.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                }`}
              >
                {ticket.priority.toUpperCase()}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  ticket.status === 'open'
                    ? 'bg-blue-100 text-blue-700'
                    : ticket.status === 'assigned'
                      ? 'bg-yellow-100 text-yellow-700'
                      : ticket.status === 'in_progress'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                }`}
              >
                {ticket.status.replace('_', ' ').toUpperCase()}
              </span>
              {ticket.unitNumber && (
                <span className="text-xs text-gray-500">
                  {ticket.unitNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Technician List */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : technicians && technicians.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Available Technicians
              </p>
              {technicians.map((tech: User) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setSelectedId(tech.id)}
                  disabled={isPending}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    selectedId === tech.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      selectedId === tech.id ? 'bg-indigo-600' : 'bg-gray-400'
                    }`}
                  >
                    {tech.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {tech.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {tech.email}
                    </p>
                  </div>
                  {selectedId === tech.id && (
                    <svg
                      className="w-5 h-5 text-indigo-600 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {ticket.assignedTo === tech.id && selectedId !== tech.id && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      Currently assigned
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👷</div>
              <p className="text-gray-600 text-sm">
                No technicians available at the moment
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
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
              className="flex-1 h-11"
              onClick={handleAssign}
              disabled={isPending || !selectedId}
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
                  Assigning...
                </span>
              ) : (
                'Assign Technician'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
