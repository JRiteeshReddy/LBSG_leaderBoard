import { Badge } from '@/components/ui/badge';
import { Shield, Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type UserRole = 'admin' | 'moderator' | 'user';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleConfig = {
  admin: {
    label: 'Dev',
    icon: Crown,
    className: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  },
  moderator: {
    label: 'Mod',
    icon: Shield,
    className: 'bg-gradient-to-r from-blue-500/20 to-red-500/20 text-primary border-primary/30',
  },
  user: {
    label: 'Player',
    icon: User,
    className: 'bg-secondary text-muted-foreground border-border',
  },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;
  
  return (
    <Badge className={cn(config.className, className)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
