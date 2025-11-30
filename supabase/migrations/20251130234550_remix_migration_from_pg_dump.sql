CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: auto_add_brian_to_group_chat(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_add_brian_to_group_chat() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  brian_id UUID;
BEGIN
  IF NEW.type = 'group' THEN
    SELECT id INTO brian_id 
    FROM agents 
    WHERE is_system = true AND name = 'Brian' 
    LIMIT 1;
    
    IF brian_id IS NOT NULL THEN
      INSERT INTO chat_agents (chat_id, agent_id, added_by)
      VALUES (NEW.id, brian_id, NEW.created_by)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: calculate_next_run_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_next_run_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: calculate_next_weekly_run(time without time zone, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_next_weekly_run(run_time time without time zone, days integer[]) RETURNS timestamp with time zone
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: get_user_workspace_ids(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_workspace_ids(_user_id uuid) RETURNS TABLE(workspace_id uuid)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT workspace_id
  FROM public.workspace_members
  WHERE user_id = _user_id;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_workspace_id uuid;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create default workspace
  INSERT INTO public.workspaces (name, description, owner_id)
  VALUES (
    'My Workspace',
    'Your personal workspace',
    NEW.id
  )
  RETURNING id INTO new_workspace_id;
  
  -- Add user as workspace member
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: is_chat_participant(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_chat_participant(_user_id uuid, _chat_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE user_id = _user_id
    AND chat_id = _chat_id
  );
$$;


--
-- Name: mark_messages_read(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_messages_read(p_chat_id uuid, p_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE messages
  SET read = true
  WHERE chat_id = p_chat_id
    AND read = false
    AND user_id IS NULL; -- Only mark agent messages as read
END;
$$;


--
-- Name: update_agent_rating(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_agent_rating() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: update_brian_conversations_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_brian_conversations_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_chat_activity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_chat_activity() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.chats
  SET last_activity = NOW()
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_knowledge_search_vector(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_knowledge_search_vector() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$;


--
-- Name: update_task_automation_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_task_automation_stats() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.tasks
    SET 
      automation_count = (
        SELECT COUNT(*) 
        FROM public.automations 
        WHERE task_id = OLD.task_id
      ),
      completed_automation_count = (
        SELECT COUNT(*) 
        FROM public.automations 
        WHERE task_id = OLD.task_id 
          AND status = 'completed'
      )
    WHERE id = OLD.task_id;
    RETURN OLD;
  ELSE
    UPDATE public.tasks
    SET 
      automation_count = (
        SELECT COUNT(*) 
        FROM public.automations 
        WHERE task_id = NEW.task_id
      ),
      completed_automation_count = (
        SELECT COUNT(*) 
        FROM public.automations 
        WHERE task_id = NEW.task_id 
          AND status = 'completed'
      )
    WHERE id = NEW.task_id;
    RETURN NEW;
  END IF;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    agent_id uuid,
    action text NOT NULL,
    entity_type text,
    entity_id uuid,
    status text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    chat_id uuid,
    CONSTRAINT activity_logs_status_check CHECK ((status = ANY (ARRAY['success'::text, 'error'::text, 'pending'::text])))
);


--
-- Name: agent_agent_relationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_agent_relationships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_a_id uuid NOT NULL,
    agent_b_id uuid NOT NULL,
    collaboration_count integer DEFAULT 0,
    last_collaboration timestamp with time zone DEFAULT now(),
    shared_context jsonb DEFAULT '{"communication_style": "professional", "successful_projects": [], "complementary_strengths": []}'::jsonb,
    rapport_score integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT no_self_relationship CHECK ((agent_a_id <> agent_b_id))
);


--
-- Name: agent_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: agent_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_configurations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_installation_id uuid NOT NULL,
    configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: agent_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_installation_id uuid,
    document_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: agent_installations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_installations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id uuid NOT NULL,
    user_id uuid NOT NULL,
    installed_at timestamp with time zone DEFAULT now() NOT NULL,
    install_state jsonb DEFAULT '{}'::jsonb,
    workspace_id uuid NOT NULL,
    custom_name text
);


--
-- Name: agent_observations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_observations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id uuid,
    user_id uuid NOT NULL,
    workspace_id uuid,
    observation text NOT NULL,
    confidence double precision DEFAULT 0.5,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: agent_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    review_text text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT agent_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    long_description text,
    category_id uuid,
    price numeric(10,2) DEFAULT 0,
    image_url text,
    publisher_id uuid,
    status text DEFAULT 'active'::text,
    rating numeric(3,2) DEFAULT 0,
    total_reviews integer DEFAULT 0,
    total_installs integer DEFAULT 0,
    capabilities text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    webhook_url text,
    api_authentication_type text DEFAULT 'none'::text,
    configuration_schema jsonb,
    response_timeout integer DEFAULT 30,
    supported_features text[] DEFAULT ARRAY['text'::text],
    workflow_json jsonb,
    workflow_file_path text,
    is_workflow_based boolean DEFAULT false,
    short_description text,
    is_chat_compatible boolean DEFAULT true,
    required_credentials jsonb DEFAULT '[]'::jsonb,
    ai_personality text,
    ai_instructions text,
    guard_rails jsonb DEFAULT '{"tone": "professional", "max_tokens": 2000, "allowed_topics": [], "blocked_topics": [], "content_filter": true, "refuse_harmful_requests": true}'::jsonb,
    is_system boolean DEFAULT false,
    personality_traits jsonb DEFAULT '{"humor": 0.5, "warmth": 0.7, "empathy": 0.8, "curiosity": 0.6}'::jsonb,
    communication_quirks text[] DEFAULT ARRAY['uses natural language'::text, 'shares relevant thoughts'::text, 'asks follow-up questions'::text],
    opinion_tendencies text,
    interests text[] DEFAULT ARRAY[]::text[],
    review_status text DEFAULT 'pending'::text,
    reviewer_notes text,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    CONSTRAINT agents_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric))),
    CONSTRAINT agents_review_status_check CHECK ((review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT agents_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text])))
);


--
-- Name: automation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    automation_id uuid NOT NULL,
    task_id uuid,
    executed_at timestamp with time zone DEFAULT now(),
    status text NOT NULL,
    output_data jsonb,
    error_message text,
    execution_time_ms integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT automation_logs_status_check CHECK ((status = ANY (ARRAY['success'::text, 'failed'::text, 'partial'::text, 'pending'::text])))
);


--
-- Name: automations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    chat_id uuid,
    name text NOT NULL,
    trigger text NOT NULL,
    action text NOT NULL,
    status text DEFAULT 'active'::text,
    last_run timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    task_id uuid,
    progress integer DEFAULT 0,
    result_data jsonb,
    agent_id uuid,
    chain_order integer DEFAULT 0,
    execution_output jsonb,
    last_execution_status text,
    last_executed_at timestamp with time zone,
    schedule_type text DEFAULT 'manual'::text,
    schedule_time time without time zone DEFAULT '09:00:00'::time without time zone,
    schedule_days integer[] DEFAULT '{}'::integer[],
    schedule_interval_minutes integer,
    schedule_cron text,
    next_run_at timestamp with time zone,
    is_enabled boolean DEFAULT true,
    timezone text DEFAULT 'UTC'::text,
    CONSTRAINT automations_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT automations_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'paused'::text])))
);


--
-- Name: brian_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brian_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    messages jsonb DEFAULT '[]'::jsonb,
    context jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    workspace_id uuid,
    title text NOT NULL,
    description text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    location text,
    attendees uuid[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_agent_memories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_agent_memories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    agent_installation_id uuid,
    category text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL
);


--
-- Name: chat_agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_agents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    agent_id uuid NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    added_by uuid
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    sender_type text NOT NULL,
    message text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chat_messages_sender_type_check CHECK ((sender_type = ANY (ARRAY['user'::text, 'agent'::text, 'system'::text])))
);


--
-- Name: chat_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    role text DEFAULT 'member'::text,
    CONSTRAINT chat_participants_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])))
);


--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    installation_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    agent_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    name text,
    type text NOT NULL,
    agent_id uuid,
    created_by uuid,
    last_activity timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chats_type_check CHECK ((type = ANY (ARRAY['direct'::text, 'group'::text, 'agent'::text])))
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    user_id uuid,
    agent_id uuid,
    content text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    error_message text,
    processing_time_ms integer,
    response_metadata jsonb,
    is_agent_to_agent boolean DEFAULT false,
    target_agent_id uuid,
    read boolean DEFAULT false
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    display_name text,
    avatar_url text,
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    workspace_id uuid,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text,
    priority text DEFAULT 'medium'::text,
    due_date timestamp with time zone,
    assigned_agent_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    automation_count integer DEFAULT 0,
    completed_automation_count integer DEFAULT 0,
    is_asap boolean DEFAULT false,
    CONSTRAINT tasks_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: user_agent_relationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_agent_relationships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    agent_id uuid,
    rapport_level integer DEFAULT 0,
    shared_context jsonb DEFAULT '{"past_wins": [], "preferences": {}, "inside_jokes": [], "communication_style": "neutral"}'::jsonb,
    last_interaction timestamp with time zone DEFAULT now(),
    interaction_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_type text NOT NULL,
    access_token text NOT NULL,
    refresh_token text,
    token_type text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    bundle_type text,
    account_email text,
    account_label text,
    scopes text[]
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: workspace_agent_memories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_agent_memories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    agent_installation_id uuid,
    category text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL
);


--
-- Name: workspace_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    name text NOT NULL,
    file_path text NOT NULL,
    file_type text NOT NULL,
    file_size bigint NOT NULL,
    folder text DEFAULT 'root'::text,
    description text,
    tags text[] DEFAULT '{}'::text[],
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    extracted_content text
);


--
-- Name: workspace_knowledge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_knowledge (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    category text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    search_vector tsvector
);


--
-- Name: workspace_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT workspace_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])))
);


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    owner_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: agent_agent_relationships agent_agent_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_agent_relationships
    ADD CONSTRAINT agent_agent_relationships_pkey PRIMARY KEY (id);


--
-- Name: agent_categories agent_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_categories
    ADD CONSTRAINT agent_categories_name_key UNIQUE (name);


--
-- Name: agent_categories agent_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_categories
    ADD CONSTRAINT agent_categories_pkey PRIMARY KEY (id);


--
-- Name: agent_configurations agent_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_configurations
    ADD CONSTRAINT agent_configurations_pkey PRIMARY KEY (id);


--
-- Name: agent_documents agent_documents_agent_installation_id_document_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_documents
    ADD CONSTRAINT agent_documents_agent_installation_id_document_id_key UNIQUE (agent_installation_id, document_id);


--
-- Name: agent_documents agent_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_documents
    ADD CONSTRAINT agent_documents_pkey PRIMARY KEY (id);


--
-- Name: agent_installations agent_installations_agent_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_installations
    ADD CONSTRAINT agent_installations_agent_id_user_id_key UNIQUE (agent_id, user_id);


--
-- Name: agent_installations agent_installations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_installations
    ADD CONSTRAINT agent_installations_pkey PRIMARY KEY (id);


--
-- Name: agent_observations agent_observations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_observations
    ADD CONSTRAINT agent_observations_pkey PRIMARY KEY (id);


--
-- Name: agent_reviews agent_reviews_agent_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_reviews
    ADD CONSTRAINT agent_reviews_agent_id_user_id_key UNIQUE (agent_id, user_id);


--
-- Name: agent_reviews agent_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_reviews
    ADD CONSTRAINT agent_reviews_pkey PRIMARY KEY (id);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- Name: automation_logs automation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_logs
    ADD CONSTRAINT automation_logs_pkey PRIMARY KEY (id);


--
-- Name: automations automations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_pkey PRIMARY KEY (id);


--
-- Name: brian_conversations brian_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brian_conversations
    ADD CONSTRAINT brian_conversations_pkey PRIMARY KEY (id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: chat_agent_memories chat_agent_memories_chat_id_agent_installation_id_category__key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_agent_memories
    ADD CONSTRAINT chat_agent_memories_chat_id_agent_installation_id_category__key UNIQUE (chat_id, agent_installation_id, category, key);


--
-- Name: chat_agent_memories chat_agent_memories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_agent_memories
    ADD CONSTRAINT chat_agent_memories_pkey PRIMARY KEY (id);


--
-- Name: chat_agents chat_agents_chat_id_agent_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_agents
    ADD CONSTRAINT chat_agents_chat_id_agent_id_key UNIQUE (chat_id, agent_id);


--
-- Name: chat_agents chat_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_agents
    ADD CONSTRAINT chat_agents_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_participants chat_participants_chat_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_chat_id_user_id_key UNIQUE (chat_id, user_id);


--
-- Name: chat_participants chat_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: agent_agent_relationships unique_agent_pair; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_agent_relationships
    ADD CONSTRAINT unique_agent_pair UNIQUE (agent_a_id, agent_b_id);


--
-- Name: brian_conversations unique_user_workspace; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brian_conversations
    ADD CONSTRAINT unique_user_workspace UNIQUE (user_id, workspace_id);


--
-- Name: user_agent_relationships user_agent_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_agent_relationships
    ADD CONSTRAINT user_agent_relationships_pkey PRIMARY KEY (id);


--
-- Name: user_agent_relationships user_agent_relationships_user_id_agent_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_agent_relationships
    ADD CONSTRAINT user_agent_relationships_user_id_agent_id_key UNIQUE (user_id, agent_id);


--
-- Name: user_credentials user_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credentials
    ADD CONSTRAINT user_credentials_pkey PRIMARY KEY (id);


--
-- Name: user_credentials user_credentials_unique_bundle; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credentials
    ADD CONSTRAINT user_credentials_unique_bundle UNIQUE (user_id, credential_type, bundle_type, account_email);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: workspace_agent_memories workspace_agent_memories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_agent_memories
    ADD CONSTRAINT workspace_agent_memories_pkey PRIMARY KEY (id);


--
-- Name: workspace_agent_memories workspace_agent_memories_workspace_id_agent_installation_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_agent_memories
    ADD CONSTRAINT workspace_agent_memories_workspace_id_agent_installation_id_key UNIQUE (workspace_id, agent_installation_id, category, key);


--
-- Name: workspace_documents workspace_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_documents
    ADD CONSTRAINT workspace_documents_pkey PRIMARY KEY (id);


--
-- Name: workspace_knowledge workspace_knowledge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_knowledge
    ADD CONSTRAINT workspace_knowledge_pkey PRIMARY KEY (id);


--
-- Name: workspace_members workspace_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (id);


--
-- Name: workspace_members workspace_members_workspace_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_user_id_key UNIQUE (workspace_id, user_id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_logs_agent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_agent_id ON public.activity_logs USING btree (agent_id);


--
-- Name: idx_activity_logs_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_chat_id ON public.activity_logs USING btree (chat_id);


--
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at DESC);


--
-- Name: idx_activity_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- Name: idx_agent_configurations_installation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agent_configurations_installation_id ON public.agent_configurations USING btree (agent_installation_id);


--
-- Name: idx_agent_documents_document; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agent_documents_document ON public.agent_documents USING btree (document_id);


--
-- Name: idx_agent_documents_installation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agent_documents_installation ON public.agent_documents USING btree (agent_installation_id);


--
-- Name: idx_agent_installations_workspace_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agent_installations_workspace_id ON public.agent_installations USING btree (workspace_id);


--
-- Name: idx_agent_observations_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agent_observations_user ON public.agent_observations USING btree (user_id, agent_id);


--
-- Name: idx_agent_observations_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agent_observations_workspace ON public.agent_observations USING btree (workspace_id);


--
-- Name: idx_agent_relationships_agents; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agent_relationships_agents ON public.agent_agent_relationships USING btree (agent_a_id, agent_b_id);


--
-- Name: idx_agents_review_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agents_review_status ON public.agents USING btree (review_status) WHERE (review_status = 'pending'::text);


--
-- Name: idx_automation_logs_automation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automation_logs_automation_id ON public.automation_logs USING btree (automation_id);


--
-- Name: idx_automation_logs_executed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automation_logs_executed_at ON public.automation_logs USING btree (executed_at DESC);


--
-- Name: idx_automation_logs_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automation_logs_task_id ON public.automation_logs USING btree (task_id);


--
-- Name: idx_automations_agent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automations_agent_id ON public.automations USING btree (agent_id);


--
-- Name: idx_automations_chain_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automations_chain_order ON public.automations USING btree (task_id, chain_order);


--
-- Name: idx_automations_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automations_chat_id ON public.automations USING btree (chat_id);


--
-- Name: idx_automations_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automations_task_id ON public.automations USING btree (task_id);


--
-- Name: idx_chat_agent_memories_agent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_agent_memories_agent ON public.chat_agent_memories USING btree (agent_installation_id);


--
-- Name: idx_chat_agent_memories_chat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_agent_memories_chat ON public.chat_agent_memories USING btree (chat_id);


--
-- Name: idx_chat_agents_agent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_agents_agent_id ON public.chat_agents USING btree (agent_id);


--
-- Name: idx_chat_agents_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_agents_chat_id ON public.chat_agents USING btree (chat_id);


--
-- Name: idx_chat_messages_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_created ON public.chat_messages USING btree (created_at DESC);


--
-- Name: idx_chat_messages_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_session ON public.chat_messages USING btree (session_id);


--
-- Name: idx_chat_sessions_agent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_agent ON public.chat_sessions USING btree (agent_id);


--
-- Name: idx_chat_sessions_installation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_installation ON public.chat_sessions USING btree (installation_id);


--
-- Name: idx_chat_sessions_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_workspace ON public.chat_sessions USING btree (workspace_id);


--
-- Name: idx_messages_agent_to_agent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_agent_to_agent ON public.messages USING btree (is_agent_to_agent, target_agent_id) WHERE (is_agent_to_agent = true);


--
-- Name: idx_messages_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_unread ON public.messages USING btree (chat_id, read) WHERE (read = false);


--
-- Name: idx_tasks_asap; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_asap ON public.tasks USING btree (is_asap) WHERE (is_asap = true);


--
-- Name: idx_user_agent_relationships; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_agent_relationships ON public.user_agent_relationships USING btree (user_id, agent_id);


--
-- Name: idx_user_credentials_bundle; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_credentials_bundle ON public.user_credentials USING btree (user_id, credential_type, bundle_type);


--
-- Name: idx_workspace_agent_memories_agent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workspace_agent_memories_agent ON public.workspace_agent_memories USING btree (agent_installation_id);


--
-- Name: idx_workspace_agent_memories_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workspace_agent_memories_workspace ON public.workspace_agent_memories USING btree (workspace_id);


--
-- Name: idx_workspace_documents_extracted_content; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workspace_documents_extracted_content ON public.workspace_documents USING gin (to_tsvector('english'::regconfig, extracted_content)) WHERE (extracted_content IS NOT NULL);


--
-- Name: idx_workspace_documents_folder; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workspace_documents_folder ON public.workspace_documents USING btree (workspace_id, folder);


--
-- Name: idx_workspace_documents_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workspace_documents_workspace ON public.workspace_documents USING btree (workspace_id);


--
-- Name: idx_workspace_knowledge_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workspace_knowledge_search ON public.workspace_knowledge USING gin (search_vector);


--
-- Name: idx_workspace_knowledge_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workspace_knowledge_workspace ON public.workspace_knowledge USING btree (workspace_id);


--
-- Name: chats add_brian_to_groups; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER add_brian_to_groups AFTER INSERT ON public.chats FOR EACH ROW EXECUTE FUNCTION public.auto_add_brian_to_group_chat();


--
-- Name: automations automation_schedule_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER automation_schedule_trigger BEFORE INSERT OR UPDATE OF schedule_type, schedule_time, schedule_days, schedule_interval_minutes ON public.automations FOR EACH ROW EXECUTE FUNCTION public.calculate_next_run_at();


--
-- Name: automations automation_task_stats_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER automation_task_stats_trigger AFTER INSERT OR DELETE OR UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.update_task_automation_stats();


--
-- Name: brian_conversations brian_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER brian_conversations_updated_at BEFORE UPDATE ON public.brian_conversations FOR EACH ROW EXECUTE FUNCTION public.update_brian_conversations_updated_at();


--
-- Name: agent_reviews on_agent_review_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_agent_review_change AFTER INSERT OR DELETE OR UPDATE ON public.agent_reviews FOR EACH ROW EXECUTE FUNCTION public.update_agent_rating();


--
-- Name: messages on_message_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_message_created AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_chat_activity();


--
-- Name: agent_reviews set_updated_at_agent_reviews; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_agent_reviews BEFORE UPDATE ON public.agent_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agents set_updated_at_agents; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_agents BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: automations set_updated_at_automations; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_automations BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: calendar_events set_updated_at_calendar_events; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_calendar_events BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles set_updated_at_profiles; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: tasks set_updated_at_tasks; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: workspaces set_updated_at_workspaces; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_workspaces BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agent_configurations update_agent_configurations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agent_configurations_updated_at BEFORE UPDATE ON public.agent_configurations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agent_agent_relationships update_agent_relationships_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agent_relationships_updated_at BEFORE UPDATE ON public.agent_agent_relationships FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: chat_agent_memories update_chat_agent_memories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_chat_agent_memories_updated_at BEFORE UPDATE ON public.chat_agent_memories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: chat_sessions update_chat_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: user_credentials update_user_credentials_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_credentials_updated_at BEFORE UPDATE ON public.user_credentials FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: workspace_agent_memories update_workspace_agent_memories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workspace_agent_memories_updated_at BEFORE UPDATE ON public.workspace_agent_memories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: workspace_documents update_workspace_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workspace_documents_updated_at BEFORE UPDATE ON public.workspace_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: workspace_knowledge update_workspace_knowledge_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workspace_knowledge_updated_at BEFORE UPDATE ON public.workspace_knowledge FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: workspace_knowledge workspace_knowledge_search_vector_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER workspace_knowledge_search_vector_update BEFORE INSERT OR UPDATE ON public.workspace_knowledge FOR EACH ROW EXECUTE FUNCTION public.update_knowledge_search_vector();


--
-- Name: activity_logs activity_logs_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;


--
-- Name: activity_logs activity_logs_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: agent_agent_relationships agent_agent_relationships_agent_a_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_agent_relationships
    ADD CONSTRAINT agent_agent_relationships_agent_a_id_fkey FOREIGN KEY (agent_a_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: agent_agent_relationships agent_agent_relationships_agent_b_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_agent_relationships
    ADD CONSTRAINT agent_agent_relationships_agent_b_id_fkey FOREIGN KEY (agent_b_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: agent_configurations agent_configurations_agent_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_configurations
    ADD CONSTRAINT agent_configurations_agent_installation_id_fkey FOREIGN KEY (agent_installation_id) REFERENCES public.agent_installations(id) ON DELETE CASCADE;


--
-- Name: agent_documents agent_documents_agent_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_documents
    ADD CONSTRAINT agent_documents_agent_installation_id_fkey FOREIGN KEY (agent_installation_id) REFERENCES public.agent_installations(id) ON DELETE CASCADE;


--
-- Name: agent_documents agent_documents_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_documents
    ADD CONSTRAINT agent_documents_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.workspace_documents(id) ON DELETE CASCADE;


--
-- Name: agent_installations agent_installations_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_installations
    ADD CONSTRAINT agent_installations_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: agent_installations agent_installations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_installations
    ADD CONSTRAINT agent_installations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: agent_installations agent_installations_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_installations
    ADD CONSTRAINT agent_installations_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id);


--
-- Name: agent_observations agent_observations_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_observations
    ADD CONSTRAINT agent_observations_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: agent_observations agent_observations_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_observations
    ADD CONSTRAINT agent_observations_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: agent_reviews agent_reviews_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_reviews
    ADD CONSTRAINT agent_reviews_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: agent_reviews agent_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_reviews
    ADD CONSTRAINT agent_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: agents agents_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.agent_categories(id);


--
-- Name: agents agents_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: agents agents_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: automation_logs automation_logs_automation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_logs
    ADD CONSTRAINT automation_logs_automation_id_fkey FOREIGN KEY (automation_id) REFERENCES public.automations(id) ON DELETE CASCADE;


--
-- Name: automation_logs automation_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_logs
    ADD CONSTRAINT automation_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: automations automations_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;


--
-- Name: automations automations_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: automations automations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: automations automations_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;


--
-- Name: automations automations_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: brian_conversations brian_conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brian_conversations
    ADD CONSTRAINT brian_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: brian_conversations brian_conversations_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brian_conversations
    ADD CONSTRAINT brian_conversations_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: calendar_events calendar_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: calendar_events calendar_events_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: chat_agent_memories chat_agent_memories_agent_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_agent_memories
    ADD CONSTRAINT chat_agent_memories_agent_installation_id_fkey FOREIGN KEY (agent_installation_id) REFERENCES public.agent_installations(id) ON DELETE CASCADE;


--
-- Name: chat_agent_memories chat_agent_memories_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_agent_memories
    ADD CONSTRAINT chat_agent_memories_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_agents chat_agents_added_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_agents
    ADD CONSTRAINT chat_agents_added_by_fkey FOREIGN KEY (added_by) REFERENCES auth.users(id);


--
-- Name: chat_agents chat_agents_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_agents
    ADD CONSTRAINT chat_agents_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: chat_agents chat_agents_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_agents
    ADD CONSTRAINT chat_agents_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE;


--
-- Name: chat_participants chat_participants_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_participants chat_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_installation_id_fkey FOREIGN KEY (installation_id) REFERENCES public.agent_installations(id) ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: chats chats_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;


--
-- Name: chats chats_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: chats chats_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: messages messages_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;


--
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: messages messages_target_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_target_agent_id_fkey FOREIGN KEY (target_agent_id) REFERENCES public.agents(id);


--
-- Name: messages messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_agent_id_fkey FOREIGN KEY (assigned_agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: user_agent_relationships user_agent_relationships_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_agent_relationships
    ADD CONSTRAINT user_agent_relationships_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: workspace_agent_memories workspace_agent_memories_agent_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_agent_memories
    ADD CONSTRAINT workspace_agent_memories_agent_installation_id_fkey FOREIGN KEY (agent_installation_id) REFERENCES public.agent_installations(id) ON DELETE CASCADE;


--
-- Name: workspace_agent_memories workspace_agent_memories_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_agent_memories
    ADD CONSTRAINT workspace_agent_memories_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspace_documents workspace_documents_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_documents
    ADD CONSTRAINT workspace_documents_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspace_knowledge workspace_knowledge_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_knowledge
    ADD CONSTRAINT workspace_knowledge_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspaces workspaces_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: agents Admins can delete agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete agents" ON public.agents FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: agent_categories Admins can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage categories" ON public.agent_categories USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: agents Anyone can view active agent details; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active agent details" ON public.agents FOR SELECT USING (
CASE
    WHEN (status = 'active'::text) THEN true
    WHEN (publisher_id = auth.uid()) THEN true
    WHEN public.has_role(auth.uid(), 'admin'::public.app_role) THEN true
    ELSE false
END);


--
-- Name: agent_agent_relationships Anyone can view agent relationships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view agent relationships" ON public.agent_agent_relationships FOR SELECT USING (true);


--
-- Name: agent_categories Anyone can view categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view categories" ON public.agent_categories FOR SELECT USING (true);


--
-- Name: agent_reviews Anyone can view reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view reviews" ON public.agent_reviews FOR SELECT USING (true);


--
-- Name: chats Chat creators can delete chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Chat creators can delete chats" ON public.chats FOR DELETE USING ((auth.uid() = created_by));


--
-- Name: chats Chat creators can update chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Chat creators can update chats" ON public.chats FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: chat_agent_memories Chat participants can create chat memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Chat participants can create chat memories" ON public.chat_agent_memories FOR INSERT WITH CHECK ((public.is_chat_participant(auth.uid(), chat_id) AND (created_by = auth.uid())));


--
-- Name: chat_agent_memories Chat participants can delete chat memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Chat participants can delete chat memories" ON public.chat_agent_memories FOR DELETE USING (public.is_chat_participant(auth.uid(), chat_id));


--
-- Name: chat_agent_memories Chat participants can update chat memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Chat participants can update chat memories" ON public.chat_agent_memories FOR UPDATE USING (public.is_chat_participant(auth.uid(), chat_id));


--
-- Name: chat_agent_memories Chat participants can view chat memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Chat participants can view chat memories" ON public.chat_agent_memories FOR SELECT USING (public.is_chat_participant(auth.uid(), chat_id));


--
-- Name: automations Creators can delete automations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Creators can delete automations" ON public.automations FOR DELETE USING ((auth.uid() = created_by));


--
-- Name: automations Creators can update automations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Creators can update automations" ON public.automations FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: workspaces Owners can delete workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can delete workspaces" ON public.workspaces FOR DELETE USING ((auth.uid() = owner_id));


--
-- Name: workspaces Owners can update workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can update workspaces" ON public.workspaces FOR UPDATE USING ((auth.uid() = owner_id));


--
-- Name: agents Publishers can create agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Publishers can create agents" ON public.agents FOR INSERT WITH CHECK ((auth.uid() = publisher_id));


--
-- Name: agents Publishers can update own agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Publishers can update own agents" ON public.agents FOR UPDATE USING (((auth.uid() = publisher_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_agent_relationships System can create agent relationships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create agent relationships" ON public.user_agent_relationships FOR INSERT WITH CHECK (true);


--
-- Name: automation_logs System can create automation logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create automation logs" ON public.automation_logs FOR INSERT WITH CHECK (true);


--
-- Name: chat_sessions System can create chat sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (true);


--
-- Name: activity_logs System can create logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create logs" ON public.activity_logs FOR INSERT WITH CHECK (true);


--
-- Name: agent_observations System can create observations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create observations" ON public.agent_observations FOR INSERT WITH CHECK (true);


--
-- Name: agent_agent_relationships System can manage agent relationships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage agent relationships" ON public.agent_agent_relationships USING (true);


--
-- Name: agent_documents Users can add agent documents to their installations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add agent documents to their installations" ON public.agent_documents FOR INSERT WITH CHECK ((agent_installation_id IN ( SELECT agent_installations.id
   FROM public.agent_installations
  WHERE (agent_installations.user_id = auth.uid()))));


--
-- Name: chat_agents Users can add agents to chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add agents to chats" ON public.chat_agents FOR INSERT WITH CHECK ((public.is_chat_participant(auth.uid(), chat_id) AND (auth.uid() = added_by)));


--
-- Name: calendar_events Users can create events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create events" ON public.calendar_events FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: agent_configurations Users can create own agent configurations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own agent configurations" ON public.agent_configurations FOR INSERT WITH CHECK ((agent_installation_id IN ( SELECT agent_installations.id
   FROM public.agent_installations
  WHERE (agent_installations.user_id = auth.uid()))));


--
-- Name: agent_reviews Users can create reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create reviews" ON public.agent_reviews FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: tasks Users can create tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: workspaces Users can create workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create workspaces" ON public.workspaces FOR INSERT WITH CHECK ((auth.uid() = owner_id));


--
-- Name: agent_documents Users can delete agent documents from their installations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete agent documents from their installations" ON public.agent_documents FOR DELETE USING ((agent_installation_id IN ( SELECT agent_installations.id
   FROM public.agent_installations
  WHERE (agent_installations.user_id = auth.uid()))));


--
-- Name: messages Users can delete messages in their chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete messages in their chats" ON public.messages FOR DELETE USING (((auth.uid() = user_id) OR (public.is_chat_participant(auth.uid(), chat_id) AND (user_id IS NULL))));


--
-- Name: agent_configurations Users can delete own agent configurations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own agent configurations" ON public.agent_configurations FOR DELETE USING ((agent_installation_id IN ( SELECT agent_installations.id
   FROM public.agent_installations
  WHERE (agent_installations.user_id = auth.uid()))));


--
-- Name: user_credentials Users can delete own credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own credentials" ON public.user_credentials FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: calendar_events Users can delete own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own events" ON public.calendar_events FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: agent_reviews Users can delete own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own reviews" ON public.agent_reviews FOR DELETE USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: tasks Users can delete own tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_credentials Users can insert own credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own credentials" ON public.user_credentials FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: agent_installations Users can install agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can install agents" ON public.agent_installations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_participants Users can join chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can join chats" ON public.chat_participants FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_participants Users can leave chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can leave chats" ON public.chat_participants FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: chat_agents Users can remove agents from chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove agents from chats" ON public.chat_agents FOR DELETE USING (public.is_chat_participant(auth.uid(), chat_id));


--
-- Name: messages Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (((auth.uid() = user_id) AND public.is_chat_participant(auth.uid(), chat_id)));


--
-- Name: chat_messages Users can send messages to their workspace chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages to their workspace chats" ON public.chat_messages FOR INSERT WITH CHECK ((session_id IN ( SELECT chat_sessions.id
   FROM public.chat_sessions
  WHERE (chat_sessions.workspace_id IN ( SELECT workspace_members.workspace_id
           FROM public.workspace_members
          WHERE (workspace_members.user_id = auth.uid()))))));


--
-- Name: agent_installations Users can uninstall agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can uninstall agents" ON public.agent_installations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: agent_configurations Users can update own agent configurations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own agent configurations" ON public.agent_configurations FOR UPDATE USING ((agent_installation_id IN ( SELECT agent_installations.id
   FROM public.agent_installations
  WHERE (agent_installations.user_id = auth.uid()))));


--
-- Name: user_credentials Users can update own credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own credentials" ON public.user_credentials FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: calendar_events Users can update own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own events" ON public.calendar_events FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: agent_installations Users can update own installations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own installations" ON public.agent_installations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: agent_reviews Users can update own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own reviews" ON public.agent_reviews FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: tasks Users can update own tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_agent_relationships Users can update their own agent relationships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own agent relationships" ON public.user_agent_relationships FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: agent_documents Users can view agent documents for their installations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view agent documents for their installations" ON public.agent_documents FOR SELECT USING ((agent_installation_id IN ( SELECT agent_installations.id
   FROM public.agent_installations
  WHERE (agent_installations.user_id = auth.uid()))));


--
-- Name: chat_agents Users can view agents in their chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view agents in their chats" ON public.chat_agents FOR SELECT USING (public.is_chat_participant(auth.uid(), chat_id));


--
-- Name: automations Users can view automations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view automations" ON public.automations FOR SELECT USING (((auth.uid() = created_by) OR (EXISTS ( SELECT 1
   FROM public.workspace_members
  WHERE ((workspace_members.workspace_id = automations.workspace_id) AND (workspace_members.user_id = auth.uid())))) OR (task_id IN ( SELECT tasks.id
   FROM public.tasks
  WHERE (tasks.user_id = auth.uid())))));


--
-- Name: chat_participants Users can view chat participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view chat participants" ON public.chat_participants FOR SELECT USING (((user_id = auth.uid()) OR public.is_chat_participant(auth.uid(), chat_id)));


--
-- Name: chat_sessions Users can view chat sessions in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view chat sessions in their workspace" ON public.chat_sessions FOR SELECT USING ((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))));


--
-- Name: chats Users can view chats in workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view chats in workspace" ON public.chats FOR SELECT USING (
CASE
    WHEN (type = 'direct'::text) THEN (EXISTS ( SELECT 1
       FROM public.workspace_members
      WHERE ((workspace_members.workspace_id = chats.workspace_id) AND (workspace_members.user_id = auth.uid()))))
    WHEN (type = 'group'::text) THEN (EXISTS ( SELECT 1
       FROM public.chat_participants
      WHERE ((chat_participants.chat_id = chats.id) AND (chat_participants.user_id = auth.uid()))))
    ELSE false
END);


--
-- Name: automation_logs Users can view logs for their task automations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view logs for their task automations" ON public.automation_logs FOR SELECT USING ((task_id IN ( SELECT tasks.id
   FROM public.tasks
  WHERE (tasks.user_id = auth.uid()))));


--
-- Name: messages Users can view messages in their chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages in their chats" ON public.messages FOR SELECT USING (public.is_chat_participant(auth.uid(), chat_id));


--
-- Name: chat_messages Users can view messages in their workspace chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages in their workspace chats" ON public.chat_messages FOR SELECT USING ((session_id IN ( SELECT chat_sessions.id
   FROM public.chat_sessions
  WHERE (chat_sessions.workspace_id IN ( SELECT workspace_members.workspace_id
           FROM public.workspace_members
          WHERE (workspace_members.user_id = auth.uid()))))));


--
-- Name: agent_observations Users can view observations about their own interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view observations about their own interactions" ON public.agent_observations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: agent_configurations Users can view own agent configurations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own agent configurations" ON public.agent_configurations FOR SELECT USING ((agent_installation_id IN ( SELECT agent_installations.id
   FROM public.agent_installations
  WHERE (agent_installations.user_id = auth.uid()))));


--
-- Name: user_credentials Users can view own credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own credentials" ON public.user_credentials FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: calendar_events Users can view own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own events" ON public.calendar_events FOR SELECT USING (((auth.uid() = user_id) OR (auth.uid() = ANY (attendees))));


--
-- Name: agent_installations Users can view own installations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own installations" ON public.agent_installations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: activity_logs Users can view own logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own logs" ON public.activity_logs FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: tasks Users can view own tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_agent_relationships Users can view their own agent relationships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own agent relationships" ON public.user_agent_relationships FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view workspace member profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view workspace member profiles" ON public.profiles FOR SELECT USING (((id = auth.uid()) OR (id IN ( SELECT wm2.user_id
   FROM (public.workspace_members wm1
     JOIN public.workspace_members wm2 ON ((wm1.workspace_id = wm2.workspace_id)))
  WHERE (wm1.user_id = auth.uid())))));


--
-- Name: workspace_members Users can view workspace members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view workspace members" ON public.workspace_members FOR SELECT USING ((workspace_id IN ( SELECT public.get_user_workspace_ids(auth.uid()) AS get_user_workspace_ids)));


--
-- Name: workspaces Users can view workspaces they're members of; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view workspaces they're members of" ON public.workspaces FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.workspace_members
  WHERE ((workspace_members.workspace_id = workspaces.id) AND (workspace_members.user_id = auth.uid())))));


--
-- Name: brian_conversations Users manage own Brian conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own Brian conversations" ON public.brian_conversations USING ((auth.uid() = user_id));


--
-- Name: workspace_members Workspace admins can add members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace admins can add members" ON public.workspace_members FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.workspace_members wm
  WHERE ((wm.workspace_id = workspace_members.workspace_id) AND (wm.user_id = auth.uid()) AND (wm.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: workspace_members Workspace admins can remove members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace admins can remove members" ON public.workspace_members FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.workspace_members wm
  WHERE ((wm.workspace_id = workspace_members.workspace_id) AND (wm.user_id = auth.uid()) AND (wm.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: automations Workspace members can create automations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can create automations" ON public.automations FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.workspace_members
  WHERE ((workspace_members.workspace_id = automations.workspace_id) AND (workspace_members.user_id = auth.uid())))));


--
-- Name: chats Workspace members can create chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can create chats" ON public.chats FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.workspace_members
  WHERE ((workspace_members.workspace_id = chats.workspace_id) AND (workspace_members.user_id = auth.uid())))));


--
-- Name: workspace_knowledge Workspace members can create knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can create knowledge" ON public.workspace_knowledge FOR INSERT WITH CHECK (((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))) AND (created_by = auth.uid())));


--
-- Name: workspace_agent_memories Workspace members can create workspace memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can create workspace memories" ON public.workspace_agent_memories FOR INSERT WITH CHECK (((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))) AND (created_by = auth.uid())));


--
-- Name: workspace_documents Workspace members can delete documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can delete documents" ON public.workspace_documents FOR DELETE USING ((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))));


--
-- Name: workspace_knowledge Workspace members can delete knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can delete knowledge" ON public.workspace_knowledge FOR DELETE USING ((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))));


--
-- Name: workspace_agent_memories Workspace members can delete workspace memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can delete workspace memories" ON public.workspace_agent_memories FOR DELETE USING ((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))));


--
-- Name: workspace_documents Workspace members can update documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can update documents" ON public.workspace_documents FOR UPDATE USING ((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))));


--
-- Name: workspace_knowledge Workspace members can update knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can update knowledge" ON public.workspace_knowledge FOR UPDATE USING ((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))));


--
-- Name: workspace_agent_memories Workspace members can update workspace memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can update workspace memories" ON public.workspace_agent_memories FOR UPDATE USING ((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))));


--
-- Name: workspace_documents Workspace members can upload documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can upload documents" ON public.workspace_documents FOR INSERT WITH CHECK (((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))) AND (uploaded_by = auth.uid())));


--
-- Name: workspace_documents Workspace members can view documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can view documents" ON public.workspace_documents FOR SELECT USING ((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))));


--
-- Name: workspace_knowledge Workspace members can view knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can view knowledge" ON public.workspace_knowledge FOR SELECT USING ((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))));


--
-- Name: workspace_agent_memories Workspace members can view workspace memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can view workspace memories" ON public.workspace_agent_memories FOR SELECT USING ((workspace_id IN ( SELECT workspace_members.workspace_id
   FROM public.workspace_members
  WHERE (workspace_members.user_id = auth.uid()))));


--
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: agent_agent_relationships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agent_agent_relationships ENABLE ROW LEVEL SECURITY;

--
-- Name: agent_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agent_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: agent_configurations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;

--
-- Name: agent_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agent_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: agent_installations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agent_installations ENABLE ROW LEVEL SECURITY;

--
-- Name: agent_observations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agent_observations ENABLE ROW LEVEL SECURITY;

--
-- Name: agent_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: agents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

--
-- Name: automation_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: automations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

--
-- Name: brian_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brian_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: calendar_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_agent_memories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_agent_memories ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_agents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_agents ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: chats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_agent_relationships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_agent_relationships ENABLE ROW LEVEL SECURITY;

--
-- Name: user_credentials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_agent_memories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspace_agent_memories ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspace_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_knowledge; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspace_knowledge ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

--
-- Name: workspaces; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


