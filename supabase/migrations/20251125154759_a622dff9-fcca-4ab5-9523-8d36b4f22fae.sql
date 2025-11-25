-- Add chain ordering and execution output to automations
ALTER TABLE automations 
ADD COLUMN chain_order integer DEFAULT 0,
ADD COLUMN execution_output jsonb,
ADD COLUMN last_execution_status text,
ADD COLUMN last_executed_at timestamp with time zone;

-- Add index for chain ordering
CREATE INDEX idx_automations_chain_order ON automations(task_id, chain_order);

-- Add comments for documentation
COMMENT ON COLUMN automations.chain_order IS 'Order of execution in the automation chain (0-indexed)';
COMMENT ON COLUMN automations.execution_output IS 'Output data from the last execution, used as input for next automation';
COMMENT ON COLUMN automations.last_execution_status IS 'Status of last execution: success, failed, pending';
COMMENT ON COLUMN automations.last_executed_at IS 'Timestamp of last execution';