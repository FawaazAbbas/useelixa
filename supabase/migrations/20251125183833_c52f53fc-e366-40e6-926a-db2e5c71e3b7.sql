-- Add chat_id column to activity_logs for linking activities to specific conversations
ALTER TABLE activity_logs 
ADD COLUMN chat_id uuid REFERENCES chats(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_activity_logs_chat_id ON activity_logs(chat_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_agent_id ON activity_logs(agent_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);