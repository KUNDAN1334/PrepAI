// components/applications/ApplicationTable.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { STATUS_LABELS, STATUS_STYLES, type ApplicationDTO } from './types';

/** Dates arrive as ISO strings and can be absent on older rows — never hand an
 * invalid Date to date-fns, which throws and takes the whole table down. */
function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : format(date, 'MMM dd, yyyy');
}

export default function ApplicationTable({
  applications,
  onUpdate,
}: {
  applications: ApplicationDTO[];
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<ApplicationDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/applications/${pendingDelete._id}`, { method: 'DELETE' });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to delete application');
      }

      toast({
        title: 'Application deleted',
        description: `${pendingDelete.companyName} — ${pendingDelete.position}`,
      });

      setPendingDelete(null);
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete application',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Last updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-ink-soft">
                  No applications yet. Add your first one.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((application) => (
                <TableRow key={application._id}>
                  <TableCell className="font-medium">{application.companyName}</TableCell>
                  <TableCell>{application.position}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[application.status] ?? 'status-neutral'}>
                      {STATUS_LABELS[application.status] ?? application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{application.priority}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(application.applicationDate)}</TableCell>
                  <TableCell>{formatDate(application.lastUpdated)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Row actions">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/applications/${application._id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-crimson"
                          onSelect={(event) => {
                            // Let the menu close before the dialog opens, or Radix
                            // hands focus back to an element that no longer exists.
                            event.preventDefault();
                            setPendingDelete(application);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.companyName} — ${pendingDelete.position} will be removed permanently.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
