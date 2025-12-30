import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-4 mt-auto">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <p>© 2024 LifeBoat Leaderboards</p>
          <p>Not affiliated with LifeBoat Network</p>
        </div>
      </footer>
    </div>
  );
}
