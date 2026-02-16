import { useState } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  PencilEdit02Icon,
  UserIcon
} from '@hugeicons/core-free-icons';
import type { Ticket, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAssignTicket } from '@/hooks/queries/use-tickets';
import { useTechnicians } from '@/hooks/queries/use-users';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-card rounded-xl shadow-lg w-full max-w-md border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Assign Ticket
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select a technician for this task
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

          {/* Ticket Summary */}
          <div className="mt-4 bg-background border border-border rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
              <HugeiconsIcon icon={PencilEdit02Icon} className="h-3 w-3" />
              <span>Working on:</span>
            </div>
            <p className="font-medium text-sm truncate">{ticket.title}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className={`
                  text-[10px] px-1.5 py-0 rounded-md font-normal uppercase border-0
                  ${ticket.priority === 'urgent' ? 'bg-red-50 text-red-700' : ''}
                  ${ticket.priority === 'high' ? 'bg-orange-50 text-orange-700' : ''}
                  ${ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' : ''}
                  ${ticket.priority === 'low' ? 'bg-slate-50 text-slate-700' : ''}
               `}>
                {ticket.priority}
              </Badge>
              {ticket.unitNumber && (
                <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                  Unit {ticket.unitNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Technician List */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-muted/40 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : technicians && technicians.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Available Technicians
              </p>
              {technicians.map((tech: User) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setSelectedId(tech.id)}
                  disabled={isPending}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${selectedId === tech.id
                      ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30 bg-card'
                    }`}
                >
                  <div className={`
                     h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                     ${selectedId === tech.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}>
                    {tech.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${selectedId === tech.id ? 'text-primary' : 'text-foreground'}`}>
                      {tech.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate opacity-80">
                      {tech.email}
                    </p>
                  </div>

                  {selectedId === tech.id && (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-primary flex-shrink-0" />
                  )}

                  {ticket.assignedTo === tech.id && selectedId !== tech.id && (
                    <span className="text-[10px] bg-muted/50 px-2 py-1 rounded text-muted-foreground whitespace-nowrap">
                      Current
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3 text-muted-foreground">
                <HugeiconsIcon icon={UserIcon} className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">No technicians found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                Make sure you have users with the "technician" role.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-muted/10 flex gap-3">
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
            className="flex-1"
            onClick={handleAssign}
            disabled={isPending || !selectedId}
          >
            {isPending ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
