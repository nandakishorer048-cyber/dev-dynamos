-- Create vital_readings table for tracking health vitals
CREATE TABLE public.vital_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reading_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  blood_sugar DECIMAL(5,1),
  pulse_rate INTEGER,
  oxygen_level DECIMAL(4,1),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vital_readings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own vital readings"
ON public.vital_readings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vital readings"
ON public.vital_readings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vital readings"
ON public.vital_readings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vital readings"
ON public.vital_readings
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_vital_readings_user_date ON public.vital_readings(user_id, reading_date DESC);