import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type UserRole = 'admin' | 'moderator' | 'user';

interface RoleAvatarProps {
  username: string;
  avatarUrl?: string | null;
  roles: UserRole[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-24 w-24 text-3xl',
};

export function RoleAvatar({ username, avatarUrl, roles, size = 'md', className }: RoleAvatarProps) {
  const isAdmin = roles.includes('admin');
  const isModerator = roles.includes('moderator');
  
  const ringClass = isAdmin ? 'role-ring-dev' : isModerator ? 'role-ring-mod' : '';
  
  return (
    <div className={cn('relative', ringClass, className)}>
      <Avatar className={cn(sizeClasses[size], 'border-2 border-background')}>
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="bg-secondary text-foreground">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
