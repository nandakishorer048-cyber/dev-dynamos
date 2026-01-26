import { useState } from 'react';
import { useGamification } from '@/hooks/useGamification';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Calendar,
  TrendingUp,
  Gift,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

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

const goalTypes = [
  { type: 'medication_taken', label: 'Medications Taken', target: 7 },
  { type: 'vitals_logged', label: 'Vitals Logged', target: 5 },
  { type: 'reports_uploaded', label: 'Reports Uploaded', target: 3 },
  { type: 'check_ins', label: 'Daily Check-ins', target: 7 },
];

export default function Rewards() {
  const {
    gamificationData,
    earnedBadges,
    allBadges,
    healthGoals,
    loading,
    checkedInToday,
    performDailyCheckIn,
    createHealthGoal,
  } = useGamification();

  const [creatingGoal, setCreatingGoal] = useState(false);

  const earnedBadgeIds = earnedBadges.map((b) => b.badge_id);

  const handleCreateGoal = async (goalType: string, targetValue: number) => {
    setCreatingGoal(true);
    await createHealthGoal(goalType, targetValue, 7);
    setCreatingGoal(false);
  };

  // Calculate level based on points
  const points = gamificationData?.totalPoints || 0;
  const level = Math.floor(points / 100) + 1;
  const pointsInLevel = points % 100;
  const pointsToNextLevel = 100 - pointsInLevel;

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <Gift className="h-8 w-8 text-primary" />
              Rewards & Progress
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your achievements and earn rewards for healthy habits
            </p>
          </div>
          {!checkedInToday && (
            <Button 
              onClick={performDailyCheckIn}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              size="lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Daily Check-in (+10 pts)
            </Button>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                  <p className="text-3xl font-bold text-yellow-600">{points}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-3xl font-bold text-orange-600">{gamificationData?.currentStreak || 0} days</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Level</p>
                  <p className="text-3xl font-bold text-purple-600">{level}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <Progress value={pointsInLevel} className="mt-3 h-2" />
              <p className="text-xs text-muted-foreground mt-1">{pointsToNextLevel} pts to level {level + 1}</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Badges Earned</p>
                  <p className="text-3xl font-bold text-green-600">{earnedBadges.length}/{allBadges.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="badges" className="gap-2">
              <Trophy className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Your Badge Collection</CardTitle>
                <CardDescription>Complete challenges to unlock badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {allBadges.map((badge) => {
                    const Icon = iconMap[badge.icon] || Star;
                    const isEarned = earnedBadgeIds.includes(badge.id);
                    const earnedBadge = earnedBadges.find((b) => b.badge_id === badge.id);

                    return (
                      <div
                        key={badge.id}
                        className={cn(
                          'relative flex flex-col items-center p-4 rounded-xl border-2 transition-all',
                          isEarned
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-400 shadow-lg'
                            : 'bg-muted/50 border-transparent opacity-60'
                        )}
                      >
                        <div
                          className={cn(
                            'flex items-center justify-center h-16 w-16 rounded-full mb-3',
                            isEarned
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                        <h4 className="font-semibold text-sm text-center">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {badge.description}
                        </p>
                        {isEarned && earnedBadge && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {format(new Date(earnedBadge.earned_at), 'MMM d, yyyy')}
                          </Badge>
                        )}
                        {!isEarned && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {badge.points_required > 0 && `${badge.points_required} pts`}
                            {badge.streak_required > 0 && `${badge.streak_required} day streak`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Active Goals */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Active Goals
                  </CardTitle>
                  <CardDescription>Complete goals to earn bonus points</CardDescription>
                </CardHeader>
                <CardContent>
                  {healthGoals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No active goals</p>
                      <p className="text-sm">Create a goal to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {healthGoals.map((goal) => {
                        const progress = (goal.current_value / goal.target_value) * 100;
                        const daysLeft = differenceInDays(new Date(goal.end_date), new Date());

                        return (
                          <div key={goal.id} className="p-4 rounded-lg border bg-muted/30">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium capitalize">
                                {goal.goal_type.replace('_', ' ')}
                              </h4>
                              <Badge variant={daysLeft <= 2 ? 'destructive' : 'secondary'}>
                                {daysLeft} days left
                              </Badge>
                            </div>
                            <Progress value={Math.min(progress, 100)} className="h-3 mb-2" />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{goal.current_value}/{goal.target_value} completed</span>
                              <span>+{goal.points_reward} pts reward</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Create Goal */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Start a New Goal
                  </CardTitle>
                  <CardDescription>Choose a weekly challenge</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {goalTypes.map((goal) => {
                      const hasActiveGoal = healthGoals.some(
                        (g) => g.goal_type === goal.type
                      );

                      return (
                        <Button
                          key={goal.type}
                          variant="outline"
                          className="w-full justify-between h-auto py-4"
                          disabled={hasActiveGoal || creatingGoal}
                          onClick={() => handleCreateGoal(goal.type, goal.target)}
                        >
                          <span className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Target className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">{goal.label}</p>
                              <p className="text-xs text-muted-foreground">
                                Complete {goal.target} in 7 days
                              </p>
                            </div>
                          </span>
                          {hasActiveGoal ? (
                            <Badge variant="secondary">Active</Badge>
                          ) : (
                            <Badge className="bg-primary">+50 pts</Badge>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Your Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Longest Streak</span>
                    <span className="font-bold text-lg">{gamificationData?.longestStreak || 0} days</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Current Level</span>
                    <span className="font-bold text-lg">Level {level}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Total Badges</span>
                    <span className="font-bold text-lg">{earnedBadges.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Goals Completed</span>
                    <span className="font-bold text-lg">
                      {earnedBadges.filter((b) => b.badge?.category === 'goals').length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {checkedInToday ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium text-success">Checked in today!</p>
                        <p className="text-sm text-muted-foreground">
                          Keep your streak going tomorrow
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/30">
                      <Flame className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium text-warning">Don't forget to check in!</p>
                        <p className="text-sm text-muted-foreground">
                          Maintain your {gamificationData?.currentStreak || 0} day streak
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    {earnedBadges.slice(0, 3).map((ub) => (
                      <div key={ub.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          {(() => {
                            const Icon = iconMap[ub.badge?.icon || 'star'] || Star;
                            return <Icon className="h-5 w-5 text-yellow-500" />;
                          })()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{ub.badge?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Earned {format(new Date(ub.earned_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
