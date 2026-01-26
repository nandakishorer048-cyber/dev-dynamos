-- Create user_gamification table for points and streaks
CREATE TABLE public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_check_in DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table for badge definitions
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_required INTEGER DEFAULT 0,
  streak_required INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table for earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create daily_check_ins table
CREATE TABLE public.daily_check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_in_date)
);

-- Create health_goals table
CREATE TABLE public.health_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  points_reward INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create point_transactions table for history
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_gamification
CREATE POLICY "Users can view own gamification data" ON public.user_gamification
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gamification data" ON public.user_gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gamification data" ON public.user_gamification
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for badges (public read)
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (true);

-- RLS policies for user_badges
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for daily_check_ins
CREATE POLICY "Users can view own check-ins" ON public.daily_check_ins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own check-ins" ON public.daily_check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for health_goals
CREATE POLICY "Users can view own goals" ON public.health_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.health_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.health_goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.health_goals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for point_transactions
CREATE POLICY "Users can view own transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_gamification_user_id ON public.user_gamification(user_id);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_daily_check_ins_user_date ON public.daily_check_ins(user_id, check_in_date DESC);
CREATE INDEX idx_health_goals_user_id ON public.health_goals(user_id);
CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id, created_at DESC);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, points_required, streak_required, category) VALUES
('First Steps', 'Complete your first daily check-in', 'footprints', 0, 1, 'streak'),
('Week Warrior', 'Maintain a 7-day streak', 'flame', 0, 7, 'streak'),
('Month Master', 'Maintain a 30-day streak', 'crown', 0, 30, 'streak'),
('Century Club', 'Earn 100 points', 'star', 100, 0, 'points'),
('Point Pro', 'Earn 500 points', 'trophy', 500, 0, 'points'),
('Health Hero', 'Earn 1000 points', 'medal', 1000, 0, 'points'),
('Medication Master', 'Take all medications on time for 7 days', 'pill', 0, 0, 'health'),
('Vital Tracker', 'Log vitals 5 times', 'activity', 0, 0, 'health'),
('Report Reader', 'Upload and analyze 3 reports', 'file-text', 0, 0, 'health'),
('Goal Getter', 'Complete your first weekly goal', 'target', 0, 0, 'goals');

-- Trigger for updated_at
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON public.user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_goals_updated_at
  BEFORE UPDATE ON public.health_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();