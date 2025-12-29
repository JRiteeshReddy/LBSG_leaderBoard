import { Layout } from '@/components/layout/Layout';
import { GamemodeCard } from '@/components/gamemodes/GamemodeCard';
import { useGamemodes } from '@/hooks/useGamemodes';
import { Skeleton } from '@/components/ui/skeleton';
import { Gamepad2 } from 'lucide-react';

export default function Gamemodes() {
  const { data: gamemodes, isLoading } = useGamemodes();

  return (
    <Layout>
      <div className="container py-12 lg:py-16">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <h1 className="font-display text-4xl font-bold">Gamemodes</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Choose a gamemode to explore its categories and compete on the leaderboards. 
            Each gamemode has unique challenges and rules.
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : gamemodes && gamemodes.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamemodes.map((gamemode) => (
              <GamemodeCard key={gamemode.id} gamemode={gamemode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No gamemodes available yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
