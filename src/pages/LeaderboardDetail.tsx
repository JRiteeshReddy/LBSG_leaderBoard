import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useGamemode, useCategory } from '@/hooks/useGamemodes';
import { useLeaderboard, formatValue, getMetricLabel } from '@/hooks/useRuns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, ArrowLeft, FileText, Plus, Play, Timer, Hash, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const metricIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  time: Timer,
  count: Hash,
  score: Star,
};

export default function LeaderboardDetail() {
  const { gamemodeSlug, categorySlug } = useParams<{ gamemodeSlug: string; categorySlug: string }>();
  const { user } = useAuth();
  const { data: gamemode } = useGamemode(gamemodeSlug || '');
  const { data: category, isLoading: categoryLoading } = useCategory(gamemodeSlug || '', categorySlug || '');
  const { data: runs, isLoading: runsLoading } = useLeaderboard(
    category?.id || '', 
    category?.metric_type || 'time'
  );

  if (categoryLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64" />
        </div>
      </Layout>
    );
  }

  if (!category || !gamemode) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-display text-xl font-bold mb-2 text-foreground">Leaderboard Not Found</h1>
          <Link to="/leaderboards">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leaderboards
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const MetricIcon = metricIcons[category.metric_type] || Timer;
  const metricLabel = getMetricLabel(category.metric_type);
  const isHigherBetter = category.metric_type !== 'time';

  return (
    <Layout>
      <div className="container py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/leaderboards" className="hover:text-primary">Leaderboards</Link>
          <span>/</span>
          <Link to={`/gamemodes/${gamemode.slug}`} className="hover:text-primary">{gamemode.name}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{category.name}</span>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Leaderboard Table */}
          <div className="lg:col-span-3">
            <div className="card-section">
              <div className="card-section-header-blue flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  {category.name} Leaderboard
                </span>
                {user && (
                  <Link to={`/submit?category=${category.id}`}>
                    <Button size="sm" className="h-7 text-xs gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
                      <Plus className="h-3 w-3" />
                      Submit
                    </Button>
                  </Link>
                )}
              </div>
              <div className="overflow-x-auto">
                {runsLoading ? (
                  <div className="p-4 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10" />)}
                  </div>
                ) : runs && runs.length > 0 ? (
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th className="w-12">Rank</th>
                        <th>Player</th>
                        <th>{metricLabel}</th>
                        <th>Date</th>
                        <th className="w-12">Video</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.map((run, index) => {
                        const rank = index + 1;
                        const isCurrentUser = user?.id === run.user_id;
                        return (
                          <tr key={run.id} className={cn(isCurrentUser && "user-highlight")}>
                            <td>
                              <span className={cn(
                                "font-mono font-bold",
                                rank === 1 && "rank-1",
                                rank === 2 && "rank-2",
                                rank === 3 && "rank-3"
                              )}>
                                {rank}
                              </span>
                            </td>
                            <td>
                              <Link
                                to={`/profile/${run.user_id}`}
                                className="flex items-center gap-2 hover:text-primary"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={run.profiles?.avatar_url || undefined} />
                                  <AvatarFallback className="text-[10px] bg-secondary">
                                    {run.profiles?.username?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{run.profiles?.username}</span>
                                {run.is_world_record && (
                                  <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0">
                                    WR
                                  </Badge>
                                )}
                              </Link>
                            </td>
                            <td>
                              <span className={cn(
                                "font-mono font-semibold",
                                category.metric_type === 'time' ? "text-primary" : "text-accent"
                              )}>
                                {formatValue(run.time_ms, category.metric_type)}
                              </span>
                            </td>
                            <td className="text-muted-foreground text-xs">
                              {new Date(run.submitted_at).toLocaleDateString()}
                            </td>
                            <td>
                              <a
                                href={run.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-7 w-7 rounded bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground transition-colors"
                              >
                                <Play className="h-3.5 w-3.5" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground mb-4">No records submitted yet</p>
                    {user ? (
                      <Link to={`/submit?category=${category.id}`}>
                        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Be the first!</Button>
                      </Link>
                    ) : (
                      <Link to="/auth">
                        <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">Sign in to submit</Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-4">
            <div className="card-section">
              <div className="card-section-header border-l-4 border-l-primary">Category Info</div>
              <div className="card-section-body space-y-3">
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs border-primary text-primary">
                    <MetricIcon className="h-3 w-3 mr-1" />
                    {metricLabel}
                  </Badge>
                  <Badge className={cn(
                    "text-xs",
                    isHigherBetter ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                  )}>
                    {isHigherBetter ? 'Higher is better' : 'Lower is better'}
                  </Badge>
                </div>
              </div>
            </div>

            {category.rules && (
              <div className="card-section">
                <div className="card-section-header flex items-center gap-2 border-l-4 border-l-accent">
                  <FileText className="h-4 w-4 text-accent" />
                  Rules
                </div>
                <div className="card-section-body">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {category.rules}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
