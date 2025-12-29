import { Link } from 'react-router-dom';
import { Gamemode } from '@/hooks/useGamemodes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Swords, Trophy, Heart, Gamepad2, ChevronRight } from 'lucide-react';

interface GamemodeCardProps {
  gamemode: Gamemode;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Swords,
  Trophy,
  Heart,
  Gamepad2,
};

export function GamemodeCard({ gamemode }: GamemodeCardProps) {
  const IconComponent = iconMap[gamemode.icon || ''] || Gamepad2;
  const categoryCount = gamemode.categories?.length || 0;

  return (
    <Link to={`/gamemodes/${gamemode.slug}`}>
      <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <IconComponent className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <CardTitle className="font-display text-xl mt-4 group-hover:text-primary transition-colors">
            {gamemode.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {gamemode.description}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {categoryCount} {categoryCount === 1 ? 'Category' : 'Categories'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
