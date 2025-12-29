import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useProfile } from '@/hooks/useProfile';
import { useUserRuns, formatTime } from '@/hooks/useRuns';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { User, Trophy, Clock, Calendar, CheckCircle, XCircle, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  approved: { icon: CheckCircle, label: 'Verified', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  pending: { icon: AlertCircle, label: 'Pending', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  rejected: { icon: XCircle, label: 'Rejected', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(userId);
  const { data: runs, isLoading: runsLoading } = useUserRuns(userId || '');

  const isOwnProfile = currentUser?.id === userId;

  const approvedRuns = runs?.filter(r => r.status === 'approved') || [];
  const pendingRuns = runs?.filter(r => r.status === 'pending') || [];
  const rejectedRuns = runs?.filter(r => r.status === 'rejected') || [];
  const worldRecords = approvedRuns.filter(r => r.is_world_record);

  if (profileLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center gap-6 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <User className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="font-display text-3xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-8">This user doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12 lg:py-16">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/30">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-secondary text-foreground text-3xl">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="font-display text-3xl font-bold mb-2">{profile.username}</h1>
                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <p className="font-display text-2xl font-bold text-primary">{approvedRuns.length}</p>
                  <p className="text-xs text-muted-foreground">Runs</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <p className="font-display text-2xl font-bold text-lifeboat-gold">{worldRecords.length}</p>
                  <p className="text-xs text-muted-foreground">Records</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Runs Tabs */}
        <Tabs defaultValue="verified">
          <TabsList className="mb-6">
            <TabsTrigger value="verified" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Verified ({approvedRuns.length})
            </TabsTrigger>
            {isOwnProfile && (
              <>
                <TabsTrigger value="pending" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Pending ({pendingRuns.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejected ({rejectedRuns.length})
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="verified">
            {runsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : approvedRuns.length > 0 ? (
              <div className="space-y-3">
                {approvedRuns.map(run => (
                  <RunItem key={run.id} run={run} />
                ))}
              </div>
            ) : (
              <EmptyState message="No verified runs yet" />
            )}
          </TabsContent>

          {isOwnProfile && (
            <>
              <TabsContent value="pending">
                {pendingRuns.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRuns.map(run => (
                      <RunItem key={run.id} run={run} showStatus />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No pending runs" />
                )}
              </TabsContent>

              <TabsContent value="rejected">
                {rejectedRuns.length > 0 ? (
                  <div className="space-y-3">
                    {rejectedRuns.map(run => (
                      <RunItem key={run.id} run={run} showStatus />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No rejected runs" />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}

function RunItem({ run, showStatus = false }: { run: any; showStatus?: boolean }) {
  const StatusIcon = statusConfig[run.status as keyof typeof statusConfig]?.icon || AlertCircle;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium truncate">
                {run.categories?.gamemodes?.name} - {run.categories?.name}
              </p>
              {run.is_world_record && (
                <Badge className="bg-lifeboat-gold/20 text-lifeboat-gold border-lifeboat-gold/30">
                  <Trophy className="h-3 w-3 mr-1" />
                  WR
                </Badge>
              )}
              {showStatus && (
                <Badge className={statusConfig[run.status as keyof typeof statusConfig]?.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[run.status as keyof typeof statusConfig]?.label}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(run.time_ms)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(run.submitted_at), { addSuffix: true })}
              </span>
            </div>
            {run.status === 'rejected' && run.rejection_reason && (
              <p className="text-sm text-destructive mt-2">Reason: {run.rejection_reason}</p>
            )}
          </div>
          <a
            href={run.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{message}</p>
      </CardContent>
    </Card>
  );
}
