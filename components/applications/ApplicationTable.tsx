// components/applications/ApplicationTable.tsx
'use client';

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
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { format } from 'date-fns';

interface ApplicationTableProps {
  applications: any[];
  onUpdate: () => void;
}

export default function ApplicationTable({ applications, onUpdate }: ApplicationTableProps) {
  // Brand status scale: neutral → warning → info → positive, with crimson for rejection.
  const statusColors = {
    applied: 'status-neutral',
    screening: 'status-warning',
    interview_scheduled: 'status-info',
    interview_completed: 'status-info',
    offer: 'status-positive',
    rejected: 'status-negative',
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-ink-soft">
                No applications found. Add your first application!
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => (
              <TableRow key={app._id}>
                <TableCell className="font-medium">{app.companyName}</TableCell>
                <TableCell>{app.position}</TableCell>
                <TableCell>
                  <Badge className={statusColors[app.status as keyof typeof statusColors]}>
                    {app.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{app.priority}</Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(app.applicationDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(app.lastUpdated), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/applications/edit/${app._id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-crimson">
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
  );
}
