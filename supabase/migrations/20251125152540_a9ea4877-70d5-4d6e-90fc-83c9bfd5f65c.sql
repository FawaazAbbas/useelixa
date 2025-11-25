-- Add ASAP field to tasks table
ALTER TABLE tasks ADD COLUMN is_asap BOOLEAN DEFAULT FALSE;

-- Add index for ASAP tasks for faster querying
CREATE INDEX idx_tasks_asap ON tasks(is_asap) WHERE is_asap = TRUE;

-- Add automation execution logs table
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial', 'pending')),
  output_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on automation_logs
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for automation_logs
CREATE POLICY "Users can view logs for their task automations"
  ON automation_logs FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create automation logs"
  ON automation_logs FOR INSERT
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_automation_logs_automation_id ON automation_logs(automation_id);
CREATE INDEX idx_automation_logs_task_id ON automation_logs(task_id);
CREATE INDEX idx_automation_logs_executed_at ON automation_logs(executed_at DESC);

-- Enable realtime for automation_logs
ALTER PUBLICATION supabase_realtime ADD TABLE automation_logs;