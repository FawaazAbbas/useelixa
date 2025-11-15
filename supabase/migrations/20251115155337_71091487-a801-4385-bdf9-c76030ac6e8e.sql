-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- ============================================
-- USER MANAGEMENT TABLES
-- ============================================

-- Profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AGENT MARKETPLACE TABLES
-- ============================================

-- Agent categories
CREATE TABLE public.agent_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.agent_categories ENABLE ROW LEVEL SECURITY;

-- Agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  category_id UUID REFERENCES public.agent_categories(id),
  price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  publisher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  total_installs INTEGER DEFAULT 0,
  capabilities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Agent reviews
CREATE TABLE public.agent_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (agent_id, user_id)
);

ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

-- Agent installations (tracks which users have installed which agents)
CREATE TABLE public.agent_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (agent_id, user_id)
);

ALTER TABLE public.agent_installations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- WORKSPACE & COLLABORATION TABLES
-- ============================================

-- Workspaces
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Workspace members
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Chats (both DMs with agents and group chats)
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group', 'agent')),
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Chat participants
CREATE TABLE public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (chat_id, user_id)
);

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCTIVITY TABLES
-- ============================================

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Calendar events
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  attendees UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SYSTEM TABLES
-- ============================================

-- Activity logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  status TEXT CHECK (status IN ('success', 'error', 'pending')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Automations
CREATE TABLE public.automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  last_run TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Function to update agent rating
CREATE OR REPLACE FUNCTION public.update_agent_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.agents
  SET 
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.agent_reviews WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)),
    total_reviews = (SELECT COUNT(*) FROM public.agent_reviews WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id))
  WHERE id = COALESCE(NEW.agent_id, OLD.agent_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update chat last_activity
CREATE OR REPLACE FUNCTION public.update_chat_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chats
  SET last_activity = NOW()
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_agents BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_agent_reviews BEFORE UPDATE ON public.agent_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_workspaces BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_calendar_events BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_automations BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for agent rating updates
CREATE TRIGGER on_agent_review_change AFTER INSERT OR UPDATE OR DELETE ON public.agent_reviews FOR EACH ROW EXECUTE FUNCTION public.update_agent_rating();

-- Trigger for chat activity
CREATE TRIGGER on_message_created AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_chat_activity();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Agent categories policies
CREATE POLICY "Anyone can view categories" ON public.agent_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.agent_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Agents policies
CREATE POLICY "Anyone can view active agents" ON public.agents FOR SELECT USING (status = 'active' OR publisher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Publishers can create agents" ON public.agents FOR INSERT WITH CHECK (auth.uid() = publisher_id);
CREATE POLICY "Publishers can update own agents" ON public.agents FOR UPDATE USING (auth.uid() = publisher_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete agents" ON public.agents FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Agent reviews policies
CREATE POLICY "Anyone can view reviews" ON public.agent_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.agent_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.agent_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.agent_reviews FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Agent installations policies
CREATE POLICY "Users can view own installations" ON public.agent_installations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can install agents" ON public.agent_installations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can uninstall agents" ON public.agent_installations FOR DELETE USING (auth.uid() = user_id);

-- Workspaces policies
CREATE POLICY "Users can view workspaces they're members of" ON public.workspaces FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = id AND user_id = auth.uid())
);
CREATE POLICY "Users can create workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update workspaces" ON public.workspaces FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete workspaces" ON public.workspaces FOR DELETE USING (auth.uid() = owner_id);

-- Workspace members policies
CREATE POLICY "Users can view workspace members" ON public.workspace_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid())
);
CREATE POLICY "Workspace admins can add members" ON public.workspace_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = workspace_members.workspace_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Workspace admins can remove members" ON public.workspace_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin'))
);

-- Chats policies
CREATE POLICY "Users can view chats they're part of" ON public.chats FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_participants WHERE chat_id = id AND user_id = auth.uid())
);
CREATE POLICY "Workspace members can create chats" ON public.chats FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = chats.workspace_id AND user_id = auth.uid())
);

-- Chat participants policies
CREATE POLICY "Users can view chat participants" ON public.chat_participants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.chat_id = chat_id AND cp.user_id = auth.uid())
);
CREATE POLICY "Users can join chats" ON public.chat_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their chats" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_participants WHERE chat_id = messages.chat_id AND user_id = auth.uid())
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.chat_participants WHERE chat_id = messages.chat_id AND user_id = auth.uid())
);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Calendar events policies
CREATE POLICY "Users can view own events" ON public.calendar_events FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ANY(attendees));
CREATE POLICY "Users can create events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON public.calendar_events FOR DELETE USING (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Users can view own logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can create logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Automations policies
CREATE POLICY "Users can view workspace automations" ON public.automations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = automations.workspace_id AND user_id = auth.uid())
);
CREATE POLICY "Workspace members can create automations" ON public.automations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = automations.workspace_id AND user_id = auth.uid())
);
CREATE POLICY "Creators can update automations" ON public.automations FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete automations" ON public.automations FOR DELETE USING (auth.uid() = created_by);

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;