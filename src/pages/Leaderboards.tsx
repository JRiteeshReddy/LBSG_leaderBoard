import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useGamemodes, Category } from '@/hooks/useGamemodes';
import { useRecentRuns, formatValue } from '@/hooks/useRuns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Swords, Target, Flame, Crosshair, Clock, ChevronRight, Gamepad2, Timer, Hash, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Swords,
  Target,
  Flame,
  Crosshair,
  Trophy,
  Gamepad2,
  Bed: Gamepad2,
};

const metricIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  time: Timer,
  count: Hash,
  score: Star,
};

export default function Leaderboards() {
  const { data: gamemodes, isLoading: gamemodesLoading } = useGamemodes();
  const { data: recentRuns, isLoading: runsLoading } = useRecentRuns(5);
  const [selectedGamemode, setSelectedGamemode] = useState<string | null>(null);

  const activeGamemode = selectedGamemode 
    ? gamemodes?.find(g => g.id === selectedGamemode)
    : gamemodes?.[0];

  return (
    <Layout>
      <div className="container py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Leaderboards
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View rankings and records for all game modes
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Gamemode Pills */}
            <div className="flex flex-wrap gap-2">
              {gamemodesLoading ? (
                <>
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-8 w-24 rounded" />
                  ))}
                </>
              ) : (
                gamemodes?.map((gamemode) => {
                  const IconComponent = iconMap[gamemode.icon || ''] || Gamepad2;
                  const isActive = activeGamemode?.id === gamemode.id;
                  
                  return (
                    <button
                      key={gamemode.id}
                      onClick={() => setSelectedGamemode(gamemode.id)}
                      className={cn(
                        "pill-button gap-1.5",
                        isActive && "active"
                      )}
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                      {gamemode.name}
                    </button>
                  );
                })
              )}
            </div>

            {/* Categories Grid */}
            {activeGamemode && (
              <div className="card-section">
                <div className="card-section-header flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {(() => {
                      const IconComponent = iconMap[activeGamemode.icon || ''] || Gamepad2;
                      return <IconComponent className="h-4 w-4 text-primary" />;
                    })()}
                    {activeGamemode.name} Categories
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activeGamemode.categories?.length || 0} categories
                  </span>
                </div>
                <div className="card-section-body">
                  {activeGamemode.categories && activeGamemode.categories.length > 0 ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {activeGamemode.categories
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((category) => {
                          const MetricIcon = metricIcons[category.metric_type] || Timer;
                          return (
                            <Link
                              key={category.id}
                              to={`/leaderboards/${activeGamemode.slug}/${category.slug}`}
                              className="group flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-muted transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                                  {category.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className="text-[10px] px-1.5 py-0 border-primary/50 text-primary"
                                  >
                                    <MetricIcon className="h-2.5 w-2.5 mr-0.5" />
                                    {category.metric_type}
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                            </Link>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No categories available
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* All Games Overview */}
            <div className="card-section">
              <div className="card-section-header">
                All Games Overview
              </div>
              <div className="overflow-x-auto">
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>Categories</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gamemodesLoading ? (
                      <>
                        {[1, 2, 3, 4].map(i => (
                          <tr key={i}>
                            <td><Skeleton className="h-4 w-24" /></td>
                            <td><Skeleton className="h-4 w-16" /></td>
                            <td><Skeleton className="h-4 w-4" /></td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      gamemodes?.map((gamemode) => {
                        const IconComponent = iconMap[gamemode.icon || ''] || Gamepad2;
                        return (
                          <tr key={gamemode.id}>
                            <td>
                              <Link 
                                to={`/gamemodes/${gamemode.slug}`}
                                className="flex items-center gap-2 hover:text-primary"
                              >
                                <IconComponent className="h-4 w-4 text-primary" />
                                <span className="font-medium">{gamemode.name}</span>
                              </Link>
                            </td>
                            <td className="text-muted-foreground">
                              {gamemode.categories?.length || 0} categories
                            </td>
                            <td>
                              <Link 
                                to={`/gamemodes/${gamemode.slug}`}
                                className="text-primary hover:underline text-xs"
                              >
                                View →
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Recent Runs */}
            <div className="card-section">
              <div className="card-section-header flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Latest Records
              </div>
              <div className="card-section-body space-y-2">
                {runsLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-14" />
                    ))}
                  </>
                ) : recentRuns && recentRuns.length > 0 ? (
                  recentRuns.map((run) => (
                    <Link
                      key={run.id}
                      to={`/leaderboards/${run.categories?.gamemodes?.slug}/${run.categories?.slug}`}
                      className="block p-2 rounded bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={run.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px] bg-muted">
                            {run.profiles?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate flex-1">
                          {run.profiles?.username}
                        </span>
                        <span className="font-mono text-xs text-primary font-medium">
                          {formatValue(run.time_ms, run.categories?.metric_type || 'time')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground truncate">
                          {run.categories?.gamemodes?.name} - {run.categories?.name}
                        </span>
                        {run.is_world_record && (
                          <Badge className="bg-accent/20 text-accent text-[10px] px-1 py-0">
                            WR
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No records yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
