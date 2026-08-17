// app/dashboard/applications/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, LayoutGrid, List, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KanbanBoard from '@/components/applications/KanbanBoard';
import ApplicationTable from '@/components/applications/ApplicationTable';
import StatsCards, { type ApplicationStatsDTO } from '@/components/applications/StatsCards';
import type { ApplicationDTO } from '@/components/applications/types';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [stats, setStats] = useState<ApplicationStatsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * List and stats are fetched together and awaited as a pair, so the tiles can
   * never show numbers from a different moment than the board below them.
   */
  const load = useCallback(async () => {
    setError(null);

    try {
      const [listResponse, statsResponse] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/applications/stats'),
      ]);

      if (!listResponse.ok) {
        const payload = await listResponse.json();
        throw new Error(payload.error || 'Could not load applications');
      }

      const list = await listResponse.json();

      // Guard against a non-array body (an error payload) reaching .filter/.map.
      setApplications(Array.isArray(list) ? list : []);
      setStats(statsResponse.ok ? await statsResponse.json() : null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load applications');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">
            Application tracker
          </h1>
          <p className="mt-2 text-ink-muted">Every application, from applied to offer</p>
        </div>
        <Link href="/dashboard/applications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add application
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="border-crimson">
          <CardContent className="flex items-center gap-3 py-4 text-sm">
            <AlertCircle className="h-5 w-5 text-crimson" />
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={load} className="ml-auto">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {stats && <StatsCards stats={stats} />}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="kanban" className="space-y-4">
          <TabsList>
            <TabsTrigger value="kanban">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="table">
              <List className="mr-2 h-4 w-4" />
              Table
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <KanbanBoard applications={applications} onUpdate={load} />
          </TabsContent>

          <TabsContent value="table">
            <ApplicationTable applications={applications} onUpdate={load} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
