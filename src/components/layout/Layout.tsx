import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-8 mt-auto">
        <div className="container text-center text-muted-foreground text-sm">
          <p>© 2024 LifeBoat Speedruns. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
