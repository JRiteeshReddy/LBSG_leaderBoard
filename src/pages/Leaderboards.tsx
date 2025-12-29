import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useGamemodes } from '@/hooks/useGamemodes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Swords, Heart, Gamepad2, ChevronRight } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Swords,
  Trophy,
  Heart,
  Gamepad2,
};

export default function Leaderboards() {
  const { data: gamemodes, isLoading } = useGamemodes();

  return (
    <Layout>
      <div className="container py-12 lg:py-16">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Trophy className="h-6 w-6" />
            </div>
            <h1 className="font-display text-4xl font-bold">Leaderboards</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Explore the rankings for each category. Select a gamemode and category to view the top times.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : gamemodes && gamemodes.length > 0 ? (
          <div className="space-y-8">
            {gamemodes.map((gamemode) => {
              const IconComponent = iconMap[gamemode.icon || ''] || Gamepad2;
              
              return (
                <Card key={gamemode.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <CardTitle className="font-display text-2xl">{gamemode.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {gamemode.categories && gamemode.categories.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gamemode.categories
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((category) => (
                            <Link
                              key={category.id}
                              to={`/leaderboards/${gamemode.slug}/${category.slug}`}
                              className="group flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                            >
                              <div>
                                <p className="font-medium group-hover:text-primary transition-colors">
                                  {category.name}
                                </p>
                                {category.difficulty && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {category.difficulty}
                                  </Badge>
                                )}
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No categories available
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No leaderboards available yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
