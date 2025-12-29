import { Link } from 'react-router-dom';
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
import { Anchor, Trophy, Gamepad2, User, LogOut, Shield, Menu } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const { user, signOut } = useAuth();
  const { data: roleData } = useUserRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/gamemodes', label: 'Gamemodes', icon: Gamepad2 },
    { to: '/leaderboards', label: 'Leaderboards', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Anchor className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 blur-lg bg-primary/30 group-hover:bg-primary/50 transition-colors" />
            </div>
            <span className="font-display text-xl font-bold">LifeBoat</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/submit" className="hidden sm:block">
                <Button className="glow-green">Submit Run</Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/50">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-secondary text-foreground">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {roleData?.isModerator && (
                    <DropdownMenuItem asChild>
                      <Link to="/moderation" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Moderation
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-2 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors"
                  >
                    <link.icon className="h-5 w-5 text-primary" />
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      to="/submit"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
                    >
                      <Trophy className="h-5 w-5" />
                      Submit Run
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
