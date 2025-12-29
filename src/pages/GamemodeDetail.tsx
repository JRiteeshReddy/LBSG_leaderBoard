import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useGamemode } from '@/hooks/useGamemodes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Swords, Trophy, Heart, Gamepad2, ChevronRight, Clock, Target, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Swords,
  Trophy,
  Heart,
  Gamepad2,
};

const difficultyColors: Record<string, string> = {
  Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Extreme: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function GamemodeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: gamemode, isLoading } = useGamemode(slug || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!gamemode) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <Gamepad2 className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="font-display text-3xl font-bold mb-4">Gamemode Not Found</h1>
          <p className="text-muted-foreground mb-8">The gamemode you're looking for doesn't exist.</p>
          <Link to="/gamemodes">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gamemodes
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const IconComponent = iconMap[gamemode.icon || ''] || Gamepad2;

  return (
    <Layout>
      <div className="container py-12 lg:py-16">
        <Link 
          to="/gamemodes" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gamemodes
        </Link>

        <div className="flex items-start gap-4 mb-8">
          <div className="p-4 rounded-xl bg-primary/10 text-primary">
            <IconComponent className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">{gamemode.name}</h1>
            <p className="text-muted-foreground text-lg">{gamemode.description}</p>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold mb-6">Categories</h2>

        {gamemode.categories && gamemode.categories.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {gamemode.categories
              .sort((a, b) => a.display_order - b.display_order)
              .map((category) => (
                <Link 
                  key={category.id} 
                  to={`/leaderboards/${gamemode.slug}/${category.slug}`}
                >
                  <Card className="h-full group transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-display text-xl group-hover:text-primary transition-colors">
                          {category.name}
                        </CardTitle>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm">{category.description}</p>
                      
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
                </Link>
              ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No categories available for this gamemode yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
