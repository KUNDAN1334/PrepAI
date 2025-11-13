// components/applications/ApplicationCard.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, MapPin, ExternalLink, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Application {
  _id: string;
  companyName: string;
  position: string;
  status: string;
  priority: string;
  applicationDate: string;
  salary?: string;
  location?: string;
  jobUrl?: string;
}

interface ApplicationCardProps {
  application: Application;
  onDelete?: (id: string) => void;
}

export default function ApplicationCard({ application, onDelete }: ApplicationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{application.companyName}</h3>
            <p className="text-sm text-gray-600">{application.position}</p>
          </div>
          <Badge className={getPriorityColor(application.priority)}>
            {application.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{new Date(application.applicationDate).toLocaleDateString()}</span>
        </div>

        {application.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{application.location}</span>
          </div>
        )}

        {application.salary && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>{application.salary}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {application.jobUrl && (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Job
              </Button>
            </a>
          )}
          <Link href={`/dashboard/applications/${application._id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
