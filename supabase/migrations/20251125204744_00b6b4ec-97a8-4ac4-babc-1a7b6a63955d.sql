-- Add read status to messages for unread tracking
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- Create index for efficient unread queries
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(chat_id, read) WHERE read = false;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(p_chat_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET read = true
  WHERE chat_id = p_chat_id
    AND read = false
    AND user_id IS NULL; -- Only mark agent messages as read
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_messages_read TO authenticated;