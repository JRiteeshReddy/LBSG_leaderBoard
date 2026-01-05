import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useActivityLogs } from '@/hooks/useActivityLog';
import { useBans, useUnbanUser } from '@/hooks/useBans';
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/hooks/useAnnouncements';
import { useAllUsers, useAssignRole, useRemoveRole } from '@/hooks/useUserManagement';
import { useGamemodes } from '@/hooks/useGamemodes';
import { 
  useCreateGamemode, 
  useUpdateGamemode, 
  useDeleteGamemode,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory 
} from '@/hooks/useGamemodeManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RoleAvatar } from '@/components/profile/RoleAvatar';
import { RoleBadge } from '@/components/profile/RoleBadge';
import { 
  Shield, Crown, Users, ScrollText, Megaphone, 
  Gamepad2, Plus, Trash2, UserPlus, UserMinus, Ban, 
  Clock, Filter, Loader2, ChevronDown, ChevronRight, FolderPlus, Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const LOG_CATEGORIES = [
  { value: 'all', label: 'All Activities' },
  { value: 'runs', label: 'Run Submissions' },
  { value: 'moderation', label: 'Moderation Actions' },
  { value: 'users', label: 'User Management' },
  { value: 'categories', label: 'Category Changes' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'bans', label: 'Bans' },
];

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { data: roleData, isLoading: roleLoading } = useUserRole();
  
  if (authLoading || roleLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!roleData?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Layout>
      <div className="container py-12 lg:py-16">
        <div className="flex items-center gap-3 mb-8">
          <Crown className="h-8 w-8 text-amber-500" />
          <h1 className="font-display text-3xl font-bold">Dev Panel</h1>
        </div>
        
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="logs" className="gap-2">
              <ScrollText className="h-4 w-4" />
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="bans" className="gap-2">
              <Ban className="h-4 w-4" />
              Bans
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              Categories
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="logs">
            <ActivityLogsTab />
          </TabsContent>
          
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          
          <TabsContent value="bans">
            <BansTab />
          </TabsContent>
          
          <TabsContent value="announcements">
            <AnnouncementsTab />
          </TabsContent>
          
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function ActivityLogsTab() {
  const [category, setCategory] = useState<string>('all');
  const { data: logs, isLoading } = useActivityLogs(category === 'all' ? undefined : category);
  
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          Activity Logs
        </CardTitle>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOG_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {logs.map((log: any) => (
              <div key={log.id} className="p-4 rounded-lg bg-secondary border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{log.category}</Badge>
                      <span className="font-medium">{log.action_type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {log.performer?.username || 'Unknown'}
                      {log.target?.username && ` → ${log.target.username}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity logs yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useAllUsers();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const [selectedRole, setSelectedRole] = useState<'moderator' | 'admin'>('moderator');
  
  const handleAssignRole = async (userId: string) => {
    try {
      await assignRole.mutateAsync({ userId, role: selectedRole });
      toast.success(`Role assigned successfully`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const handleRemoveRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    try {
      await removeRole.mutateAsync({ userId, role });
      toast.success(`Role removed successfully`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {users?.map((u: any) => (
              <div key={u.id} className="p-4 rounded-lg bg-secondary border border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <RoleAvatar 
                    username={u.username} 
                    avatarUrl={u.avatar_url} 
                    roles={u.roles} 
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">{u.username}</p>
                    <div className="flex gap-1 mt-1">
                      {u.roles.map((role: any) => (
                        <RoleBadge key={role} role={role} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moderator">Mod</SelectItem>
                      <SelectItem value="admin">Dev</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={() => handleAssignRole(u.id)}
                    disabled={assignRole.isPending}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  {u.roles.includes('moderator') && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleRemoveRole(u.id, 'moderator')}
                      disabled={removeRole.isPending}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BansTab() {
  const { data: bans, isLoading } = useBans();
  const unbanUser = useUnbanUser();
  
  const handleUnban = async (banId: string) => {
    try {
      await unbanUser.mutateAsync(banId);
      toast.success('User unbanned successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="h-5 w-5" />
          Active Bans
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : bans && bans.length > 0 ? (
          <div className="space-y-3">
            {bans.map((ban: any) => (
              <div key={ban.id} className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-between">
                <div>
                  <p className="font-medium">{ban.banned_user?.username || 'Unknown User'}</p>
                  <p className="text-sm text-muted-foreground">
                    Banned by {ban.banned_by_user?.username || 'Unknown'}
                  </p>
                  {ban.reason && (
                    <p className="text-sm text-destructive">Reason: {ban.reason}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {ban.is_permanent ? 'Permanent' : `Expires ${formatDistanceToNow(new Date(ban.expires_at), { addSuffix: true })}`}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleUnban(ban.id)}
                  disabled={unbanUser.isPending}
                >
                  Unban
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Ban className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active bans</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnnouncementsTab() {
  const { data: announcements, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const handleCreate = async () => {
    try {
      await createAnnouncement.mutateAsync({ title, content });
      toast.success('Announcement created');
      setDialogOpen(false);
      setTitle('');
      setContent('');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement.mutateAsync(id);
      toast.success('Announcement deleted');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Announcements
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input 
                placeholder="Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
              <Textarea 
                placeholder="Content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreate} 
                disabled={!title || !content || createAnnouncement.isPending}
              >
                {createAnnouncement.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="p-4 rounded-lg bg-secondary border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">{ann.title}</h3>
                    <p className="text-sm text-muted-foreground">{ann.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      by {ann.creator?.username || 'Unknown'} • {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(ann.id)}
                    disabled={deleteAnnouncement.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No announcements yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CategoriesTab() {
  const { data: gamemodes, isLoading } = useGamemodes();
  const createGamemode = useCreateGamemode();
  const updateGamemode = useUpdateGamemode();
  const deleteGamemode = useDeleteGamemode();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  
  const [gamemodeDialogOpen, setGamemodeDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedGamemodeId, setSelectedGamemodeId] = useState<string | null>(null);
  const [expandedGamemodes, setExpandedGamemodes] = useState<string[]>([]);
  
  // Gamemode form state
  const [gamemodeName, setGamemodeName] = useState('');
  const [gamemodeSlug, setGamemodeSlug] = useState('');
  const [gamemodeDescription, setGamemodeDescription] = useState('');
  const [gamemodeIcon, setGamemodeIcon] = useState('');
  
  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryRules, setCategoryRules] = useState('');
  const [categoryMetricType, setCategoryMetricType] = useState<'time' | 'count' | 'score'>('time');
  const [categoryDifficulty, setCategoryDifficulty] = useState('Medium');
  
  const toggleExpanded = (id: string) => {
    setExpandedGamemodes(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };
  
  const handleCreateGamemode = async () => {
    try {
      await createGamemode.mutateAsync({
        name: gamemodeName,
        slug: gamemodeSlug || generateSlug(gamemodeName),
        description: gamemodeDescription || undefined,
        icon: gamemodeIcon || undefined,
      });
      toast.success('Gamemode created successfully');
      setGamemodeDialogOpen(false);
      resetGamemodeForm();
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const handleCreateCategory = async () => {
    if (!selectedGamemodeId) return;
    try {
      await createCategory.mutateAsync({
        gamemode_id: selectedGamemodeId,
        name: categoryName,
        slug: categorySlug || generateSlug(categoryName),
        description: categoryDescription || undefined,
        rules: categoryRules || undefined,
        metric_type: categoryMetricType,
        difficulty: categoryDifficulty,
      });
      toast.success('Category created successfully');
      setCategoryDialogOpen(false);
      resetCategoryForm();
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const handleDeleteGamemode = async (id: string) => {
    if (!confirm('Are you sure? This will delete all categories under this gamemode.')) return;
    try {
      await deleteGamemode.mutateAsync(id);
      toast.success('Gamemode deleted');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast.success('Category deleted');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const resetGamemodeForm = () => {
    setGamemodeName('');
    setGamemodeSlug('');
    setGamemodeDescription('');
    setGamemodeIcon('');
  };
  
  const resetCategoryForm = () => {
    setCategoryName('');
    setCategorySlug('');
    setCategoryDescription('');
    setCategoryRules('');
    setCategoryMetricType('time');
    setCategoryDifficulty('Medium');
    setSelectedGamemodeId(null);
  };
  
  const openCategoryDialog = (gamemodeId: string) => {
    setSelectedGamemodeId(gamemodeId);
    setCategoryDialogOpen(true);
  };
  
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Categories Management
        </CardTitle>
        <Dialog open={gamemodeDialogOpen} onOpenChange={setGamemodeDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Gamemode
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Gamemode</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gm-name">Name *</Label>
                <Input 
                  id="gm-name"
                  placeholder="e.g. SkyWars" 
                  value={gamemodeName} 
                  onChange={(e) => {
                    setGamemodeName(e.target.value);
                    if (!gamemodeSlug) setGamemodeSlug(generateSlug(e.target.value));
                  }} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gm-slug">Slug</Label>
                <Input 
                  id="gm-slug"
                  placeholder="skywars" 
                  value={gamemodeSlug} 
                  onChange={(e) => setGamemodeSlug(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gm-description">Description</Label>
                <Textarea 
                  id="gm-description"
                  placeholder="Description of the gamemode" 
                  value={gamemodeDescription} 
                  onChange={(e) => setGamemodeDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gm-icon">Icon (emoji or icon name)</Label>
                <Input 
                  id="gm-icon"
                  placeholder="⚔️" 
                  value={gamemodeIcon} 
                  onChange={(e) => setGamemodeIcon(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateGamemode} 
                disabled={!gamemodeName || createGamemode.isPending}
              >
                {createGamemode.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Gamemode
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Category Creation Dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name *</Label>
                <Input 
                  id="cat-name"
                  placeholder="e.g. Fastest Kill" 
                  value={categoryName} 
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (!categorySlug) setCategorySlug(generateSlug(e.target.value));
                  }} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input 
                  id="cat-slug"
                  placeholder="fastest-kill" 
                  value={categorySlug} 
                  onChange={(e) => setCategorySlug(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-description">Description</Label>
                <Textarea 
                  id="cat-description"
                  placeholder="Description of the category" 
                  value={categoryDescription} 
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-rules">Rules</Label>
                <Textarea 
                  id="cat-rules"
                  placeholder="Category rules and requirements" 
                  value={categoryRules} 
                  onChange={(e) => setCategoryRules(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Metric Type</Label>
                  <Select value={categoryMetricType} onValueChange={(v: 'time' | 'count' | 'score') => setCategoryMetricType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Time</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={categoryDifficulty} onValueChange={setCategoryDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateCategory} 
                disabled={!categoryName || !selectedGamemodeId || createCategory.isPending}
              >
                {createCategory.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : gamemodes && gamemodes.length > 0 ? (
          <div className="space-y-3">
            {gamemodes.map((gm: any) => (
              <Collapsible 
                key={gm.id} 
                open={expandedGamemodes.includes(gm.id)}
                onOpenChange={() => toggleExpanded(gm.id)}
              >
                <div className="p-4 rounded-lg bg-secondary border border-border">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left">
                      {expandedGamemodes.includes(gm.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          {gm.icon && <span className="text-lg">{gm.icon}</span>}
                          <h3 className="font-semibold">{gm.name}</h3>
                          <Badge variant="outline">{gm.categories?.length || 0} categories</Badge>
                        </div>
                        {gm.description && (
                          <p className="text-sm text-muted-foreground">{gm.description}</p>
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCategoryDialog(gm.id);
                        }}
                      >
                        <FolderPlus className="h-4 w-4 mr-1" />
                        Add Category
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGamemode(gm.id);
                        }}
                        disabled={deleteGamemode.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CollapsibleContent className="mt-4 space-y-2">
                    {gm.categories && gm.categories.length > 0 ? (
                      gm.categories.map((cat: any) => (
                        <div 
                          key={cat.id} 
                          className="p-3 rounded-md bg-card border border-border flex items-center justify-between ml-7"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{cat.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {cat.metric_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {cat.difficulty}
                              </Badge>
                            </div>
                            {cat.description && (
                              <p className="text-sm text-muted-foreground">{cat.description}</p>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteCategory(cat.id)}
                            disabled={deleteCategory.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground ml-7">No categories yet. Add one!</p>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No gamemodes yet</p>
            <p className="text-sm">Create your first gamemode to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
