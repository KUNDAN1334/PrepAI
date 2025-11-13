// components/applications/KanbanBoard.tsx
'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApplicationCard from './ApplicationCard';

interface Application {
  _id: string;
  companyName: string;
  position: string;
  status: string;
  priority: string;
  applicationDate: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

interface KanbanBoardProps {
  applications: Application[];
  onUpdate: () => void;
}

const columns = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-100' },
  { id: 'screening', title: 'Screening', color: 'bg-yellow-100' },
  { id: 'interview_scheduled', title: 'Interview', color: 'bg-purple-100' },
  { id: 'offer', title: 'Offer', color: 'bg-green-100' },
];

export default function KanbanBoard({ applications, onUpdate }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const applicationId = active.id as string;
    const newStatus = over.id as string;

    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: 'Status updated',
        description: 'Application status has been updated successfully',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      });
    }

    setActiveId(null);
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter((app) => app.status === status);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="space-y-3">
            <div className={`${column.color} rounded-lg p-3`}>
              <h3 className="font-semibold text-sm">
                {column.title}
                <span className="ml-2 text-xs text-gray-600">
                  ({getApplicationsByStatus(column.id).length})
                </span>
              </h3>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {getApplicationsByStatus(column.id).map((app) => (
                <ApplicationCard key={app._id} application={app} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <ApplicationCard
            application={applications.find((app) => app._id === activeId)!}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
