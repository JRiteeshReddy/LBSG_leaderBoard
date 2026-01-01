import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trophy, Gamepad2, User, LogOut, Shield, Menu, Play, Crown } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

export function Header() {
  const { user, signOut } = useAuth();
  const { data: roleData } = useUserRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/gamemodes', label: 'Games', icon: Gamepad2, color: 'blue' },
    { to: '/leaderboards', label: 'Leaderboards', icon: Trophy, color: 'red' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="LifeBoat" className="h-8 w-8" />
            <span className="font-display text-lg font-bold hidden sm:block text-foreground">LifeBoat</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors",
                  isActive(link.to)
                    ? link.color === 'blue' 
                      ? "bg-primary/10 text-primary" 
                      : "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/submit" className="hidden sm:block">
                <Button size="sm" className="gap-1.5 text-sm bg-accent text-accent-foreground hover:bg-accent/90">
                  <Play className="h-4 w-4" />
                  Submit
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-secondary text-foreground text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {roleData?.isModerator && (
                    <DropdownMenuItem asChild>
                      <Link to="/moderation" className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-accent" />
                        Moderation
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {roleData?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500" />
                        Dev Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-accent">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=signup" className="hidden sm:block">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-background border-border">
              <nav className="flex flex-col gap-1 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive(link.to)
                        ? link.color === 'blue'
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <Link
                    to="/submit"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary text-accent"
                  >
                    <Play className="h-4 w-4" />
                    Submit Record
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
