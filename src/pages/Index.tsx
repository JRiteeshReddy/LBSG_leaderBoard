import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useGamemodes } from '@/hooks/useGamemodes';
import { useRecentRuns, formatTime } from '@/hooks/useRuns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Swords, Target, Flame, Crosshair, Clock, Play, ChevronRight, Gamepad2, Users, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Swords,
  Target,
  Flame,
  Crosshair,
  Trophy,
  Gamepad2,
};

export default function Index() {
  const { user } = useAuth();
  const { data: gamemodes, isLoading: gamemodesLoading } = useGamemodes();
  const { data: recentRuns, isLoading: runsLoading } = useRecentRuns(10);

  // Get world records from recent runs
  const worldRecords = recentRuns?.filter(r => r.is_world_record).slice(0, 5) || [];

  return (
    <Layout>
      <div className="container py-6">
        {/* Hero Section - Compact */}
        <div className="mb-8 p-6 bg-card border border-border rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                LifeBoat Leaderboards
              </h1>
              <p className="text-muted-foreground text-sm">
                Competitive rankings for LifeBoat Minecraft Bedrock Server
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/leaderboards">
                <Button variant="secondary" size="sm">
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboards
                </Button>
              </Link>
              {user ? (
                <Link to="/submit">
                  <Button size="sm" className="glow-green">
                    <Play className="h-4 w-4 mr-2" />
                    Submit Run
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Modes Section */}
            <div className="card-section">
              <div className="card-section-header flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-primary" />
                  Game Modes
                </span>
                <Link to="/gamemodes" className="text-xs text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="card-section-body">
                {gamemodesLoading ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {gamemodes?.map((gamemode) => {
                      const IconComponent = iconMap[gamemode.icon || ''] || Gamepad2;
                      const categoryCount = gamemode.categories?.length || 0;
                      
                      return (
                        <Link
                          key={gamemode.id}
                          to={`/gamemodes/${gamemode.slug}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-muted transition-colors group"
                        >
                          <div className="p-2 rounded bg-primary/10 text-primary">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">
                              {gamemode.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {categoryCount} {categoryCount === 1 ? 'category' : 'categories'}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Runs Table */}
            <div className="card-section">
              <div className="card-section-header flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Submissions
              </div>
              <div className="overflow-x-auto">
                {runsLoading ? (
                  <div className="p-4 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : recentRuns && recentRuns.length > 0 ? (
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>Game</th>
                        <th>Category</th>
                        <th>Player</th>
                        <th>Time</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRuns.map((run) => (
                        <tr key={run.id} className="animate-fade-in">
                          <td>
                            <span className="text-foreground">
                              {run.categories?.gamemodes?.name}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/leaderboards/${run.categories?.gamemodes?.slug}/${run.categories?.slug}`}
                              className="text-primary hover:underline"
                            >
                              {run.categories?.name}
                            </Link>
                          </td>
                          <td>
                            <Link
                              to={`/profile/${run.user_id}`}
                              className="flex items-center gap-2 hover:text-primary"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={run.profiles?.avatar_url || undefined} />
                                <AvatarFallback className="text-[10px] bg-secondary">
                                  {run.profiles?.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{run.profiles?.username}</span>
                            </Link>
                          </td>
                          <td>
                            <span className="font-mono text-primary font-medium">
                              {formatTime(run.time_ms)}
                            </span>
                            {run.is_world_record && (
                              <Badge className="ml-2 bg-lifeboat-gold/20 text-lifeboat-gold text-[10px] px-1.5 py-0">
                                WR
                              </Badge>
                            )}
                          </td>
                          <td className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(run.submitted_at), { addSuffix: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No runs submitted yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* World Records */}
            <div className="card-section">
              <div className="card-section-header flex items-center gap-2">
                <Trophy className="h-4 w-4 text-lifeboat-gold" />
                World Records
              </div>
              <div className="card-section-body space-y-3">
                {worldRecords.length > 0 ? (
                  worldRecords.map((run) => (
                    <div key={run.id} className="flex items-center gap-3 p-2 rounded bg-secondary/50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={run.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-secondary">
                          {run.profiles?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/profile/${run.user_id}`}
                          className="text-sm font-medium hover:text-primary truncate block"
                        >
                          {run.profiles?.username}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          {run.categories?.gamemodes?.name} - {run.categories?.name}
                        </p>
                      </div>
                      <span className="font-mono text-sm text-lifeboat-gold font-bold">
                        {formatTime(run.time_ms)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No world records yet
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="card-section">
              <div className="card-section-header flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Statistics
              </div>
              <div className="card-section-body grid grid-cols-2 gap-3">
                <div className="stat-block text-center">
                  <p className="stat-block-value">{gamemodes?.length || 0}</p>
                  <p className="stat-block-label">Games</p>
                </div>
                <div className="stat-block text-center">
                  <p className="stat-block-value">
                    {gamemodes?.reduce((acc, g) => acc + (g.categories?.length || 0), 0) || 0}
                  </p>
                  <p className="stat-block-label">Categories</p>
                </div>
                <div className="stat-block text-center">
                  <p className="stat-block-value">{recentRuns?.length || 0}</p>
                  <p className="stat-block-label">Recent Runs</p>
                </div>
                <div className="stat-block text-center">
                  <p className="stat-block-value">{worldRecords.length}</p>
                  <p className="stat-block-label">Records</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card-section">
              <div className="card-section-header flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Quick Links
              </div>
              <div className="card-section-body space-y-2">
                <Link
                  to="/leaderboards"
                  className="flex items-center gap-2 p-2 rounded hover:bg-secondary transition-colors text-sm"
                >
                  <Trophy className="h-4 w-4 text-primary" />
                  Full Leaderboards
                </Link>
                <Link
                  to="/gamemodes"
                  className="flex items-center gap-2 p-2 rounded hover:bg-secondary transition-colors text-sm"
                >
                  <Gamepad2 className="h-4 w-4 text-primary" />
                  All Game Modes
                </Link>
                {user && (
                  <Link
                    to="/submit"
                    className="flex items-center gap-2 p-2 rounded hover:bg-secondary transition-colors text-sm"
                  >
                    <Play className="h-4 w-4 text-primary" />
                    Submit a Run
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
