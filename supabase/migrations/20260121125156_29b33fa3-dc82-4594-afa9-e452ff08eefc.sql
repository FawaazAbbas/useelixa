-- Drop agent-related tables (CASCADE to handle dependencies)
DROP TABLE IF EXISTS agent_documents CASCADE;
DROP TABLE IF EXISTS agent_configurations CASCADE;
DROP TABLE IF EXISTS agent_installations CASCADE;
DROP TABLE IF EXISTS agent_observations CASCADE;
DROP TABLE IF EXISTS agent_reviews CASCADE;
DROP TABLE IF EXISTS agent_agent_relationships CASCADE;
DROP TABLE IF EXISTS agent_categories CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- Drop old chat system tables
DROP TABLE IF EXISTS chat_agents CASCADE;
DROP TABLE IF EXISTS chat_agent_memories CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;

-- Drop waitlist/referral tables
DROP TABLE IF EXISTS referral_uses CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS waitlist_invites CASCADE;
DROP TABLE IF EXISTS waitlist_signups CASCADE;
DROP TABLE IF EXISTS invite_rate_limits CASCADE;
DROP TABLE IF EXISTS developer_applications CASCADE;

-- Drop automation tables
DROP TABLE IF EXISTS automation_logs CASCADE;
DROP TABLE IF EXISTS automations CASCADE;

-- Drop other legacy tables
DROP TABLE IF EXISTS brian_conversations CASCADE;
DROP TABLE IF EXISTS user_agent_relationships CASCADE;
DROP TABLE IF EXISTS workspace_agent_memories CASCADE;
DROP TABLE IF EXISTS user_integrations CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS workspace_knowledge CASCADE;
DROP TABLE IF EXISTS workspace_documents CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;