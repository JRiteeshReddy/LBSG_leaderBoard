import { ReactNode } from 'react';
import { Header } from './Header';
import { AnimatedBackground } from './AnimatedBackground';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <AnimatedBackground />
      <Header />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <footer className="border-t border-border py-4 mt-auto relative z-10 bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <p>© 2024 LifeBoat Leaderboards</p>
          <p>Not affiliated with LifeBoat Network. Stats tracking for all game modes.</p>
        </div>
      </footer>
    </div>
  );
}
