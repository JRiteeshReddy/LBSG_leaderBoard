import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { usePendingRuns, useVerifyRun, formatTime } from '@/hooks/useRuns';
import { useBanUser } from '@/hooks/useBans';
import { useLogActivity } from '@/hooks/useActivityLog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Clock, Calendar, ExternalLink, Check, X, Loader2, ArrowLeft, AlertTriangle, Ban, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Moderation() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: roleData, isLoading: roleLoading } = useUserRole();
  const { data: pendingRuns, isLoading: runsLoading } = usePendingRuns();
  const verifyRun = useVerifyRun();
  const banUser = useBanUser();
  const logActivity = useLogActivity();
  const { toast } = useToast();

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; runId: string | null }>({ open: false, runId: null });
  const [banDialog, setBanDialog] = useState<{ open: boolean; userId: string | null; username: string }>({ open: false, userId: null, username: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('24');

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!roleData?.isModerator) {
        navigate('/');
      }
    }
  }, [user, authLoading, roleData, roleLoading, navigate]);

  const handleApprove = async (runId: string, username: string) => {
    try {
      await verifyRun.mutateAsync({ runId, status: 'approved' });
      await logActivity.mutateAsync({
        action_type: 'APPROVE_RUN',
        category: 'moderation',
        description: `Approved run from ${username}`,
      });
      toast({ title: 'Run approved', description: 'The run has been verified and added to the leaderboard.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve run', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.runId) return;
    
    try {
      await verifyRun.mutateAsync({ 
        runId: rejectDialog.runId, 
        status: 'rejected',
        rejectionReason: rejectReason || undefined,
      });
      await logActivity.mutateAsync({
        action_type: 'REJECT_RUN',
        category: 'moderation',
        description: `Rejected run${rejectReason ? `: ${rejectReason}` : ''}`,
      });
      toast({ title: 'Run rejected', description: 'The run has been rejected.' });
      setRejectDialog({ open: false, runId: null });
      setRejectReason('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject run', variant: 'destructive' });
    }
  };

  const handleBan = async () => {
    if (!banDialog.userId) return;
    
    try {
      await banUser.mutateAsync({
        user_id: banDialog.userId,
        reason: banReason || undefined,
        duration_hours: parseInt(banDuration),
      });
      await logActivity.mutateAsync({
        action_type: 'BAN_USER',
        category: 'bans',
        description: `Banned ${banDialog.username} for ${banDuration} hours${banReason ? `: ${banReason}` : ''}`,
        target_user_id: banDialog.userId,
      });
      toast({ title: 'User banned', description: `${banDialog.username} has been banned for ${banDuration} hours.` });
      setBanDialog({ open: false, userId: null, username: '' });
      setBanReason('');
      setBanDuration('24');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to ban user', variant: 'destructive' });
    }
  };

  if (authLoading || roleLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-accent/20 text-accent">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Moderation Queue</h1>
            <p className="text-muted-foreground">Review and verify pending run submissions</p>
          </div>
        </div>

        {runsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : pendingRuns && pendingRuns.length > 0 ? (
          <div className="space-y-4">
            {pendingRuns.map(run => (
              <Card key={run.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Run Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={run.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="bg-secondary text-foreground">
                            {run.profiles?.username?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{run.profiles?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {run.categories?.gamemodes?.name} - {run.categories?.name}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setBanDialog({ open: true, userId: run.user_id, username: run.profiles?.username || 'User' })}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <Badge variant="secondary" className="text-lg font-display">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(run.time_ms)}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(run.submitted_at), { addSuffix: true })}
                        </span>
                      </div>

                      {run.notes && (
                        <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
                          {run.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col items-center gap-3">
                      <a
                        href={run.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 lg:flex-none"
                      >
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Watch Video
                        </Button>
                      </a>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(run.id, run.profiles?.username || 'Unknown')}
                          disabled={verifyRun.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {verifyRun.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setRejectDialog({ open: true, runId: run.id })}
                          disabled={verifyRun.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-display text-xl font-bold mb-2">Queue is empty</h3>
              <p className="text-muted-foreground">No pending runs to review at the moment.</p>
            </CardContent>
          </Card>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, runId: open ? rejectDialog.runId : null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Reject Run
              </DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this run. The user will be able to see this.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Reason for rejection (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog({ open: false, runId: null })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={verifyRun.isPending}>
                {verifyRun.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Reject Run
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban Dialog */}
        <Dialog open={banDialog.open} onOpenChange={(open) => setBanDialog({ open, userId: open ? banDialog.userId : null, username: open ? banDialog.username : '' })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                Ban User: {banDialog.username}
              </DialogTitle>
              <DialogDescription>
                Temporarily ban this user from submitting runs.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <Select value={banDuration} onValueChange={setBanDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="72">3 days</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Reason for ban (optional)"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBanDialog({ open: false, userId: null, username: '' })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBan} disabled={banUser.isPending}>
                {banUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Ban User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
