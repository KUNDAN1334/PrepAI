// components/applications/StatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * Mirrors the shape of GET /api/applications/stats. The previous version expected
 * `{ pending, offers, rejected }` while the API returned `{ byStatus: {...} }`,
 * so every tile rendered `undefined` — the contract is now shared and explicit.
 */
export interface ApplicationStatsDTO {
  total: number;
  pending: number;
  offers: number;
  rejected: number;
}

const TILES = [
  { key: 'total', label: 'Total applications', icon: Briefcase, className: 'text-ink-muted' },
  { key: 'pending', label: 'In progress', icon: Clock, className: 'text-gold-ink' },
  { key: 'offers', label: 'Offers', icon: CheckCircle, className: 'text-azure' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, className: 'text-crimson' },
] as const;

export default function StatsCards({ stats }: { stats: ApplicationStatsDTO }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {TILES.map((tile) => (
        <Card key={tile.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{tile.label}</CardTitle>
            <tile.icon className={`h-4 w-4 ${tile.className}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[tile.key] ?? 0}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
