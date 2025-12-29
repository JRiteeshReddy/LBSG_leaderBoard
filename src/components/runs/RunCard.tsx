import { Link } from 'react-router-dom';
import { Run, formatTime } from '@/hooks/useRuns';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Calendar, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RunCardProps {
  run: Run;
  rank?: number;
  showCategory?: boolean;
}

export function RunCard({ run, rank, showCategory = false }: RunCardProps) {
  const isWR = rank === 1 || run.is_world_record;
  const isTop3 = rank && rank <= 3;

  const getRankColor = (r: number) => {
    if (r === 1) return 'text-lifeboat-gold';
    if (r === 2) return 'text-lifeboat-silver';
    if (r === 3) return 'text-lifeboat-bronze';
    return 'text-muted-foreground';
  };

  const getRankBg = (r: number) => {
    if (r === 1) return 'bg-lifeboat-gold/10 border-lifeboat-gold/30';
    if (r === 2) return 'bg-lifeboat-silver/10 border-lifeboat-silver/30';
    if (r === 3) return 'bg-lifeboat-bronze/10 border-lifeboat-bronze/30';
    return 'bg-secondary border-border';
  };

  return (
    <Card className={`group transition-all hover:border-primary/50 ${isWR ? 'world-record border-lifeboat-gold/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {rank && (
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg border ${getRankBg(rank)}`}>
              <span className={`font-display text-xl font-bold ${getRankColor(rank)}`}>
                #{rank}
              </span>
            </div>
          )}

          <Link to={`/profile/${run.user_id}`} className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={run.profiles?.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-foreground text-sm">
                {run.profiles?.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate group-hover:text-primary transition-colors">
                {run.profiles?.username || 'Unknown'}
              </p>
              {showCategory && run.categories && (
                <p className="text-sm text-muted-foreground truncate">
                  {run.categories.gamemodes?.name} - {run.categories.name}
                </p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-display text-lg font-bold">{formatTime(run.time_ms)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(run.submitted_at), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isWR && (
                <Badge className="bg-lifeboat-gold/20 text-lifeboat-gold border-lifeboat-gold/30">
                  <Trophy className="h-3 w-3 mr-1" />
                  WR
                </Badge>
              )}
              <a
                href={run.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
