import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useGamemode, useCategory } from '@/hooks/useGamemodes';
import { useLeaderboard } from '@/hooks/useRuns';
import { RunCard } from '@/components/runs/RunCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Target, ArrowLeft, FileText, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LeaderboardDetail() {
  const { gamemodeSlug, categorySlug } = useParams<{ gamemodeSlug: string; categorySlug: string }>();
  const { user } = useAuth();
  const { data: gamemode } = useGamemode(gamemodeSlug || '');
  const { data: category, isLoading: categoryLoading } = useCategory(gamemodeSlug || '', categorySlug || '');
  const { data: runs, isLoading: runsLoading } = useLeaderboard(category?.id || '');

  if (categoryLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!category || !gamemode) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="font-display text-3xl font-bold mb-4">Leaderboard Not Found</h1>
          <p className="text-muted-foreground mb-8">The leaderboard you're looking for doesn't exist.</p>
          <Link to="/leaderboards">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leaderboards
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const difficultyColors: Record<string, string> = {
    Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Extreme: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <Layout>
      <div className="container py-12 lg:py-16">
        <Link 
          to="/leaderboards" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leaderboards
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Leaderboard */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-muted-foreground mb-1">{gamemode.name}</p>
                <h1 className="font-display text-3xl lg:text-4xl font-bold flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-primary" />
                  {category.name}
                </h1>
              </div>
              {user && (
                <Link to={`/submit?category=${category.id}`}>
                  <Button className="glow-green">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Run
                  </Button>
                </Link>
              )}
            </div>

            {runsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : runs && runs.length > 0 ? (
              <div className="space-y-3">
                {runs.map((run, index) => (
                  <RunCard key={run.id} run={run} rank={index + 1} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-display text-xl font-bold mb-2">No runs yet</h3>
                  <p className="text-muted-foreground mb-6">Be the first to submit a run for this category!</p>
                  {user ? (
                    <Link to={`/submit?category=${category.id}`}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Submit a Run
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/auth">
                      <Button>Sign in to Submit</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Category Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{category.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {category.difficulty && (
                    <Badge className={difficultyColors[category.difficulty] || 'bg-secondary'}>
                      <Target className="h-3 w-3 mr-1" />
                      {category.difficulty}
                    </Badge>
                  )}
                  {category.estimated_time && (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {category.estimated_time}
                    </Badge>
                  )}
                  {category.timing_method && (
                    <Badge variant="outline">{category.timing_method}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {category.rules && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {category.rules}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
