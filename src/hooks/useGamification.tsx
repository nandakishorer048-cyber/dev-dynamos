import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface GamificationData {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  streak_required: number;
  category: string;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface HealthGoal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  is_completed: boolean;
  points_reward: number;
}

export function useGamification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);

  const fetchGamificationData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch or create gamification record
      let { data: gamification } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!gamification) {
        const { data: newGamification } = await supabase
          .from('user_gamification')
          .insert({ user_id: user.id })
          .select()
          .single();
        gamification = newGamification;
      }

      if (gamification) {
        setGamificationData({
          totalPoints: gamification.total_points,
          currentStreak: gamification.current_streak,
          longestStreak: gamification.longest_streak,
          lastCheckIn: gamification.last_check_in,
        });
      }

      // Check if already checked in today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayCheckIn } = await supabase
        .from('daily_check_ins')
        .select('id')
        .eq('user_id', user.id)
        .eq('check_in_date', today)
        .maybeSingle();

      setCheckedInToday(!!todayCheckIn);

      // Fetch all badges
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .order('points_required', { ascending: true });

      setAllBadges(badges || []);

      // Fetch earned badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id);

      const formattedBadges = (userBadges || []).map((ub: any) => ({
        id: ub.id,
        badge_id: ub.badge_id,
        earned_at: ub.earned_at,
        badge: ub.badges,
      }));

      setEarnedBadges(formattedBadges);

      // Fetch active health goals
      const { data: goals } = await supabase
        .from('health_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .gte('end_date', today)
        .order('end_date', { ascending: true });

      setHealthGoals(goals || []);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const performDailyCheckIn = async () => {
    if (!user || checkedInToday) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Insert check-in
      await supabase
        .from('daily_check_ins')
        .insert({ user_id: user.id, check_in_date: today, points_earned: 10 });

      // Get current gamification data
      const { data: currentData } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!currentData) return;

      // Calculate new streak
      const lastCheckIn = currentData.last_check_in;
      let newStreak = 1;
      
      if (lastCheckIn === yesterday) {
        newStreak = currentData.current_streak + 1;
      }

      const newLongestStreak = Math.max(newStreak, currentData.longest_streak);
      const newPoints = currentData.total_points + 10;

      // Update gamification data
      await supabase
        .from('user_gamification')
        .update({
          total_points: newPoints,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_check_in: today,
        })
        .eq('user_id', user.id);

      // Add point transaction
      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          points: 10,
          action: 'daily_check_in',
          description: 'Daily check-in bonus',
        });

      // Check for new badges
      await checkAndAwardBadges(newPoints, newStreak);

      toast({
        title: '🎉 Daily Check-in Complete!',
        description: `+10 points! Streak: ${newStreak} day${newStreak > 1 ? 's' : ''}`,
      });

      setCheckedInToday(true);
      fetchGamificationData();
    } catch (error) {
      console.error('Error performing check-in:', error);
    }
  };

  const checkAndAwardBadges = async (points: number, streak: number) => {
    if (!user) return;

    const earnedBadgeIds = earnedBadges.map((b) => b.badge_id);

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let shouldAward = false;

      // Check points-based badges
      if (badge.points_required > 0 && points >= badge.points_required) {
        shouldAward = true;
      }

      // Check streak-based badges
      if (badge.streak_required > 0 && streak >= badge.streak_required) {
        shouldAward = true;
      }

      if (shouldAward) {
        await supabase
          .from('user_badges')
          .insert({ user_id: user.id, badge_id: badge.id });

        toast({
          title: '🏆 New Badge Earned!',
          description: `You earned the "${badge.name}" badge!`,
        });
      }
    }
  };

  const awardPoints = async (points: number, action: string, description: string) => {
    if (!user || !gamificationData) return;

    try {
      const newTotal = gamificationData.totalPoints + points;

      await supabase
        .from('user_gamification')
        .update({ total_points: newTotal })
        .eq('user_id', user.id);

      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          points,
          action,
          description,
        });

      await checkAndAwardBadges(newTotal, gamificationData.currentStreak);

      toast({
        title: `+${points} Points!`,
        description,
      });

      fetchGamificationData();
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  const createHealthGoal = async (goalType: string, targetValue: number, daysToComplete: number) => {
    if (!user) return;

    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + daysToComplete * 86400000).toISOString().split('T')[0];

      await supabase.from('health_goals').insert({
        user_id: user.id,
        goal_type: goalType,
        target_value: targetValue,
        start_date: startDate,
        end_date: endDate,
        points_reward: 50,
      });

      toast({
        title: '🎯 New Goal Created!',
        description: `Complete ${targetValue} ${goalType} in ${daysToComplete} days`,
      });

      fetchGamificationData();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const updateGoalProgress = async (goalId: string, increment: number = 1) => {
    if (!user) return;

    try {
      const goal = healthGoals.find((g) => g.id === goalId);
      if (!goal) return;

      const newValue = goal.current_value + increment;
      const isCompleted = newValue >= goal.target_value;

      await supabase
        .from('health_goals')
        .update({
          current_value: newValue,
          is_completed: isCompleted,
        })
        .eq('id', goalId);

      if (isCompleted) {
        await awardPoints(goal.points_reward, 'goal_completed', `Completed: ${goal.goal_type}`);
      }

      fetchGamificationData();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  return {
    gamificationData,
    earnedBadges,
    allBadges,
    healthGoals,
    loading,
    checkedInToday,
    performDailyCheckIn,
    awardPoints,
    createHealthGoal,
    updateGoalProgress,
    refetch: fetchGamificationData,
  };
}
