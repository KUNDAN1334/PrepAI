// components/applications/KanbanBoard.tsx
'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ApplicationCard from './ApplicationCard';
import { STATUS_LABELS, type ApplicationDTO } from './types';

/** Board columns, in pipeline order. Withdrawn is intentionally table-only. */
const COLUMNS = [
  { id: 'applied', color: 'bg-muted' },
  { id: 'screening', color: 'bg-peach' },
  { id: 'interview_scheduled', color: 'bg-azure/20' },
  { id: 'offer', color: 'bg-gold/30' },
  { id: 'rejected', color: 'bg-crimson/15' },
] as const;

function Column({
  id,
  color,
  count,
  children,
}: {
  id: string;
  color: string;
  count: number;
  children: React.ReactNode;
}) {
  // useDroppable is what makes `over` non-null in handleDragEnd. Without it the
  // board rendered fine but every drop was silently discarded.
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="space-y-3">
      <div className={cn(color, 'rounded-lg p-3')}>
        <h3 className="text-sm font-semibold">
          {STATUS_LABELS[id]}
          <span className="ml-2 text-xs text-ink-muted">({count})</span>
        </h3>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'min-h-[400px] space-y-3 rounded-lg border-2 border-dashed p-2 transition-colors',
          isOver ? 'border-ink bg-paper' : 'border-transparent'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function KanbanBoard({
  applications,
  onUpdate,
}: {
  applications: ApplicationDTO[];
  onUpdate: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  // An 8px activation distance keeps a click on the drag handle from being
  // interpreted as a drag, which would eat button presses on touch devices.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicationId = String(active.id);
    const newStatus = String(over.id);
    const application = applications.find((item) => item._id === applicationId);

    if (!application || application.status === newStatus) return;

    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to update status');
      }

      toast({
        title: 'Status updated',
        description: `${application.companyName} → ${STATUS_LABELS[newStatus]}`,
      });

      // The parent refetches; the board is not optimistic on purpose, so what you
      // see always matches what the database accepted.
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const activeApplication = applications.find((item) => item._id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event: DragStartEvent) => setActiveId(String(event.active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((column) => {
          const items = applications.filter((item) => item.status === column.id);

          return (
            <Column key={column.id} id={column.id} color={column.color} count={items.length}>
              {items.map((item) => (
                <ApplicationCard key={item._id} application={item} draggable />
              ))}
              {items.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-ink-soft">Drop a card here</p>
              )}
            </Column>
          );
        })}
      </div>

      <DragOverlay>
        {activeApplication ? <ApplicationCard application={activeApplication} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
