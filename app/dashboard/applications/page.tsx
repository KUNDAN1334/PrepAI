// app/dashboard/applications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutGrid, List, Calendar } from 'lucide-react';
import Link from 'next/link';
import KanbanBoard from '@/components/applications/KanbanBoard';
import ApplicationTable from '@/components/applications/ApplicationTable';
import StatsCards from '@/components/applications/StatsCards';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/applications/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Tracker</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your job applications
          </p>
        </div>
        <Link href="/dashboard/applications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </div>

      {stats && <StatsCards stats={stats} />}

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="table">
            <List className="mr-2 h-4 w-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <KanbanBoard 
            applications={applications} 
            onUpdate={fetchApplications}
          />
        </TabsContent>

        <TabsContent value="table">
          <ApplicationTable 
            applications={applications}
            onUpdate={fetchApplications}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="p-8 text-center">
            <p className="text-gray-600">Calendar view coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
