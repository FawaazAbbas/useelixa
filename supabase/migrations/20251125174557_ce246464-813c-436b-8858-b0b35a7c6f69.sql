-- Add scheduling columns to automations table
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS schedule_type TEXT DEFAULT 'manual';
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS schedule_time TIME DEFAULT '09:00:00';
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS schedule_days INTEGER[] DEFAULT '{}';
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS schedule_interval_minutes INTEGER;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS schedule_cron TEXT;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS next_run_at TIMESTAMPTZ;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Helper function to calculate next weekly run
CREATE OR REPLACE FUNCTION calculate_next_weekly_run(run_time TIME, days INTEGER[])
RETURNS TIMESTAMPTZ AS $$
DECLARE
  current_day INTEGER;
  next_day INTEGER;
  days_ahead INTEGER;
  next_run TIMESTAMPTZ;
BEGIN
  current_day := EXTRACT(DOW FROM CURRENT_DATE)::INTEGER;
  
  -- Find the next scheduled day
  FOR i IN 0..6 LOOP
    next_day := (current_day + i) % 7;
    IF next_day = ANY(days) THEN
      days_ahead := i;
      next_run := (CURRENT_DATE + (days_ahead || ' days')::INTERVAL + run_time)::TIMESTAMPTZ;
      
      -- If it's today but time has passed, move to next occurrence
      IF next_run <= NOW() AND days_ahead = 0 THEN
        CONTINUE;
      END IF;
      
      RETURN next_run;
    END IF;
  END LOOP;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger function to auto-calculate next_run_at
CREATE OR REPLACE FUNCTION calculate_next_run_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.schedule_type = 'manual' THEN
    NEW.next_run_at := NULL;
  ELSIF NEW.schedule_type = 'daily' THEN
    NEW.next_run_at := (CURRENT_DATE + NEW.schedule_time)::TIMESTAMPTZ;
    IF NEW.next_run_at <= NOW() THEN
      NEW.next_run_at := NEW.next_run_at + INTERVAL '1 day';
    END IF;
  ELSIF NEW.schedule_type = 'weekly' AND array_length(NEW.schedule_days, 1) > 0 THEN
    NEW.next_run_at := calculate_next_weekly_run(NEW.schedule_time, NEW.schedule_days);
  ELSIF NEW.schedule_type = 'interval' AND NEW.schedule_interval_minutes > 0 THEN
    NEW.next_run_at := NOW() + (NEW.schedule_interval_minutes || ' minutes')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS automation_schedule_trigger ON public.automations;
CREATE TRIGGER automation_schedule_trigger
  BEFORE INSERT OR UPDATE OF schedule_type, schedule_time, schedule_days, schedule_interval_minutes
  ON public.automations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_next_run_at();