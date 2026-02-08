import { useGamification } from '@/hooks/useGamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  Flame, 
  Trophy, 
  Target, 
  CheckCircle2,
  Sparkles,
  Crown,
  Medal,
  Footprints,
  Pill,
  Activity,
  FileText,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  star: Star,
  flame: Flame,
  trophy: Trophy,
  target: Target,
  crown: Crown,
  medal: Medal,
  footprints: Footprints,
  pill: Pill,
  activity: Activity,
  'file-text': FileText,
};

export function GamificationCard() {
  const {
    gamificationData,
    earnedBadges,
    allBadges,
    healthGoals,
    loading,
    checkedInToday,
    performDailyCheckIn,
  } = useGamification();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const earnedBadgeIds = earnedBadges.map((b) => b.badge_id);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-health-purple/10 to-health-blue/10 border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-health-mint flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          Your Progress
        </CardTitle>
        <CardDescription>Keep up the great work!</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-health-mint/10 border border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-health-mint mx-auto mb-2 flex items-center justify-center shadow-warm">
                <Star className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-2xl font-extrabold gradient-text">{gamificationData?.totalPoints || 0}</p>
              <p className="text-xs text-muted-foreground font-medium">Points</p>
            </div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-health-purple/15 via-health-purple/10 to-accent/10 border border-health-purple/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-health-purple/5 to-transparent" />
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-health-purple to-accent mx-auto mb-2 flex items-center justify-center shadow-md">
                <Flame className="h-5 w-5 text-health-purple-foreground" />
              </div>
              <p className="text-2xl font-extrabold gradient-text-purple">{gamificationData?.currentStreak || 0}</p>
              <p className="text-xs text-muted-foreground font-medium">Streak</p>
            </div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-health-blue/15 via-health-blue/10 to-primary/10 border border-health-blue/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-health-blue/5 to-transparent" />
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-health-blue to-primary mx-auto mb-2 flex items-center justify-center shadow-md">
                <Trophy className="h-5 w-5 text-health-blue-foreground" />
              </div>
              <p className="text-2xl font-extrabold text-health-blue">{earnedBadges.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Badges</p>
            </div>
          </div>
        </div>

        {/* Daily Check-in */}
        <div className="p-4 rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-health-mint/5">
          {checkedInToday ? (
            <div className="flex items-center justify-center gap-3 text-success">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success-foreground" />
              </div>
              <span className="font-semibold">Checked in today! +10 points</span>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Don't break your streak!</p>
              <Button 
                onClick={performDailyCheckIn}
                className="rounded-xl bg-gradient-to-r from-primary to-health-mint hover:from-primary/90 hover:to-health-mint/90 shadow-warm transition-all duration-300 hover:shadow-glow"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Daily Check-in (+10 pts)
              </Button>
            </div>
          )}
        </div>

        {/* Badges Preview */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Badges ({earnedBadges.length}/{allBadges.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {allBadges.slice(0, 6).map((badge) => {
              const Icon = iconMap[badge.icon] || Star;
              const isEarned = earnedBadgeIds.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={cn(
                    'flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-300',
                    isEarned
                      ? 'bg-gradient-to-br from-primary to-health-mint text-primary-foreground shadow-warm badge-glow animate-glow'
                      : 'bg-muted/60 text-muted-foreground opacity-50 border border-border'
                  )}
                  title={`${badge.name}: ${badge.description}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              );
            })}
            {allBadges.length > 6 && (
              <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-muted/60 text-muted-foreground text-xs font-semibold border border-border">
                +{allBadges.length - 6}
              </div>
            )}
          </div>
        </div>

        {/* Active Goals */}
        {healthGoals.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Active Goals
            </h4>
            <div className="space-y-3">
              {healthGoals.slice(0, 2).map((goal) => {
                const progress = (goal.current_value / goal.target_value) * 100;
                return (
                  <div key={goal.id} className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{goal.goal_type.replace('_', ' ')}</span>
                      <span className="text-muted-foreground font-medium">
                        {goal.current_value}/{goal.target_value}
                      </span>
                    </div>
                    <div className="progress-gradient">
                      <Progress value={Math.min(progress, 100)} className="h-2.5 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
