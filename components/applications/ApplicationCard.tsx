// components/applications/ApplicationCard.tsx
'use client';

import Link from 'next/link';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, IndianRupee, MapPin, ExternalLink, Pencil, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRIORITY_STYLES, type ApplicationDTO } from './types';

/**
 * A card renders in two contexts: inside the Kanban board (draggable) and inside
 * the drag overlay (a static copy that follows the cursor). `draggable` switches
 * the dnd-kit wiring off for the overlay copy, which must not register itself as
 * a second draggable sharing the same id.
 */
export default function ApplicationCard({
  application,
  draggable = false,
}: {
  application: ApplicationDTO;
  draggable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: application._id,
    disabled: !draggable,
  });

  return (
    <Card
      ref={draggable ? setNodeRef : undefined}
      className={cn(
        'transition-shadow',
        isDragging && 'opacity-40',
        !isDragging && 'hover:shadow-[6px_6px_0_var(--ink)]'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            {draggable && (
              // Only the handle starts a drag: if the whole card were the handle it
              // would swallow clicks on the Edit / Job post buttons.
              <button
                type="button"
                className="mt-1 cursor-grab touch-none text-ink-soft active:cursor-grabbing"
                aria-label={`Move ${application.companyName}`}
                {...listeners}
                {...attributes}
              >
                <GripVertical className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{application.companyName}</h3>
              <p className="truncate text-sm text-ink-muted">{application.position}</p>
            </div>
          </div>
          <Badge className={PRIORITY_STYLES[application.priority] ?? 'status-neutral'}>
            {application.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <Calendar className="h-4 w-4" />
          <span>
            {application.applicationDate
              ? new Date(application.applicationDate).toLocaleDateString()
              : '—'}
          </span>
        </div>

        {application.location && (
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{application.location}</span>
          </div>
        )}

        {application.salary && (
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <IndianRupee className="h-4 w-4" />
            <span className="truncate">{application.salary}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {application.jobUrl && (
            <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="mr-1 h-4 w-4" />
                Job post
              </Button>
            </a>
          )}
          <Link href={`/dashboard/applications/${application._id}/edit`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              <Pencil className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
