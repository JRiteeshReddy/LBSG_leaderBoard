import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useGamemodes } from '@/hooks/useGamemodes';
import { useSubmitRun, parseValue, getMetricPlaceholder, getMetricHelpText, getMetricLabel } from '@/hooks/useRuns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trophy, Youtube, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';

export default function Submit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { data: gamemodes } = useGamemodes();
  const submitRun = useSubmitRun();
  const { toast } = useToast();

  const [form, setForm] = useState({
    gamemode_id: '',
    category_id: searchParams.get('category') || '',
    value: '',
    youtube_url: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Auto-select gamemode if category is pre-selected
  useEffect(() => {
    if (form.category_id && gamemodes) {
      for (const gm of gamemodes) {
        const cat = gm.categories?.find(c => c.id === form.category_id);
        if (cat) {
          setForm(f => ({ ...f, gamemode_id: gm.id }));
          break;
        }
      }
    }
  }, [form.category_id, gamemodes]);

  const selectedGamemode = gamemodes?.find(g => g.id === form.gamemode_id);
  const selectedCategory = selectedGamemode?.categories?.find(c => c.id === form.category_id);
  const metricType = selectedCategory?.metric_type || 'time';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    if (!form.category_id) {
      setErrors({ category_id: 'Please select a category' });
      return;
    }
    if (!form.value) {
      setErrors({ value: 'Please enter your record value' });
      return;
    }
    
    const youtubeSchema = z.string().url().refine(
      (url) => url.includes('youtube.com') || url.includes('youtu.be'),
      'Please enter a valid YouTube URL'
    );
    
    const urlResult = youtubeSchema.safeParse(form.youtube_url);
    if (!urlResult.success) {
      setErrors({ youtube_url: 'Please enter a valid YouTube URL' });
      return;
    }

    try {
      const time_ms = parseValue(form.value, metricType);
      
      await submitRun.mutateAsync({
        category_id: form.category_id,
        time_ms,
        youtube_url: form.youtube_url,
        notes: form.notes || undefined,
      });

      toast({
        title: 'Record submitted!',
        description: 'Your record has been submitted for verification.',
      });
      
      navigate(`/profile/${user?.id}`);
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
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
      <div className="container max-w-2xl py-12 lg:py-16">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="font-display text-2xl">Submit a Record</CardTitle>
                <CardDescription>Submit your record for verification</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Game Mode</Label>
                  <Select
                    value={form.gamemode_id}
                    onValueChange={(value) => setForm({ ...form, gamemode_id: value, category_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select game mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {gamemodes?.map((gm) => (
                        <SelectItem key={gm.id} value={gm.id}>
                          {gm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category_id}
                    onValueChange={(value) => setForm({ ...form, category_id: value })}
                    disabled={!form.gamemode_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedGamemode?.categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  {getMetricLabel(metricType)}
                </Label>
                <Input
                  id="value"
                  placeholder={getMetricPlaceholder(metricType)}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {getMetricHelpText(metricType)}
                </p>
                {errors.value && <p className="text-sm text-destructive">{errors.value}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube_url" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube Video URL
                </Label>
                <Input
                  id="youtube_url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.youtube_url}
                  onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                />
                {errors.youtube_url && <p className="text-sm text-destructive">{errors.youtube_url}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional details about your record..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitRun.isPending}
              >
                {submitRun.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Record
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
