-- Fix function search path security issue
DROP FUNCTION IF EXISTS mark_messages_read(UUID, UUID);

CREATE OR REPLACE FUNCTION mark_messages_read(p_chat_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET read = true
  WHERE chat_id = p_chat_id
    AND read = false
    AND user_id IS NULL; -- Only mark agent messages as read
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION mark_messages_read TO authenticated;