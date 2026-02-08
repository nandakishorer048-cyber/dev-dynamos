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
  FileText
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
      <Card className="shadow-soft">
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
    <Card className="shadow-soft overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-health-purple/10 to-health-blue/10">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Your Progress
        </CardTitle>
        <CardDescription>Keep up the great work!</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-health-blue/10 border border-primary/20">
            <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">{gamificationData?.totalPoints || 0}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-health-purple/10 to-accent/20 border border-health-purple/20">
            <Flame className="h-6 w-6 mx-auto mb-2 text-health-purple" />
            <p className="text-2xl font-bold text-health-purple">{gamificationData?.currentStreak || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-health-blue/10 to-primary/10 border border-health-blue/20">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-health-blue" />
            <p className="text-2xl font-bold text-health-blue">{earnedBadges.length}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>

        {/* Daily Check-in */}
        <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
          {checkedInToday ? (
            <div className="flex items-center justify-center gap-3 text-success">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-medium">Checked in today! +10 points</span>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Don't break your streak!</p>
              <Button 
                onClick={performDailyCheckIn}
                className="bg-gradient-to-r from-primary to-health-blue hover:from-primary/90 hover:to-health-blue/90"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Daily Check-in (+10 pts)
              </Button>
            </div>
          )}
        </div>

        {/* Badges Preview */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
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
                    'flex items-center justify-center h-10 w-10 rounded-full transition-all',
                    isEarned
                      ? 'bg-gradient-to-br from-primary to-health-blue text-white shadow-lg'
                      : 'bg-muted text-muted-foreground opacity-50'
                  )}
                  title={`${badge.name}: ${badge.description}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              );
            })}
            {allBadges.length > 6 && (
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                +{allBadges.length - 6}
              </div>
            )}
          </div>
        </div>

        {/* Active Goals */}
        {healthGoals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Active Goals
            </h4>
            <div className="space-y-3">
              {healthGoals.slice(0, 2).map((goal) => {
                const progress = (goal.current_value / goal.target_value) * 100;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{goal.goal_type.replace('_', ' ')}</span>
                      <span className="text-muted-foreground">
                        {goal.current_value}/{goal.target_value}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
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
