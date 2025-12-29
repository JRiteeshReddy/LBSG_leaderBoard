import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Gamemodes from "./pages/Gamemodes";
import GamemodeDetail from "./pages/GamemodeDetail";
import Leaderboards from "./pages/Leaderboards";
import LeaderboardDetail from "./pages/LeaderboardDetail";
import Submit from "./pages/Submit";
import Profile from "./pages/Profile";
import Moderation from "./pages/Moderation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/gamemodes" element={<Gamemodes />} />
            <Route path="/gamemodes/:slug" element={<GamemodeDetail />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/leaderboards/:gamemodeSlug/:categorySlug" element={<LeaderboardDetail />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/moderation" element={<Moderation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
