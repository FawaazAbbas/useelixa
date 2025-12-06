export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          agent_id: string | null
          chat_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          agent_id?: string | null
          chat_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          agent_id?: string | null
          chat_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_agent_relationships: {
        Row: {
          agent_a_id: string
          agent_b_id: string
          collaboration_count: number | null
          created_at: string | null
          id: string
          last_collaboration: string | null
          rapport_score: number | null
          shared_context: Json | null
          updated_at: string | null
        }
        Insert: {
          agent_a_id: string
          agent_b_id: string
          collaboration_count?: number | null
          created_at?: string | null
          id?: string
          last_collaboration?: string | null
          rapport_score?: number | null
          shared_context?: Json | null
          updated_at?: string | null
        }
        Update: {
          agent_a_id?: string
          agent_b_id?: string
          collaboration_count?: number | null
          created_at?: string | null
          id?: string
          last_collaboration?: string | null
          rapport_score?: number | null
          shared_context?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_agent_relationships_agent_a_id_fkey"
            columns: ["agent_a_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_agent_relationships_agent_b_id_fkey"
            columns: ["agent_b_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      agent_configurations: {
        Row: {
          agent_installation_id: string
          configuration: Json | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          agent_installation_id: string
          configuration?: Json | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          agent_installation_id?: string
          configuration?: Json | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_configurations_agent_installation_id_fkey"
            columns: ["agent_installation_id"]
            isOneToOne: false
            referencedRelation: "agent_installations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_documents: {
        Row: {
          agent_installation_id: string | null
          created_at: string | null
          document_id: string | null
          id: string
        }
        Insert: {
          agent_installation_id?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
        }
        Update: {
          agent_installation_id?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_documents_agent_installation_id_fkey"
            columns: ["agent_installation_id"]
            isOneToOne: false
            referencedRelation: "agent_installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "workspace_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_installations: {
        Row: {
          agent_id: string
          custom_name: string | null
          id: string
          install_state: Json | null
          installed_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          agent_id: string
          custom_name?: string | null
          id?: string
          install_state?: Json | null
          installed_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          agent_id?: string
          custom_name?: string | null
          id?: string
          install_state?: Json | null
          installed_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_installations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_installations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_observations: {
        Row: {
          agent_id: string | null
          confidence: number | null
          created_at: string | null
          id: string
          observation: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          observation: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          observation?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_observations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_observations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_reviews: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          ai_instructions: string | null
          ai_personality: string | null
          api_authentication_type: string | null
          capabilities: string[] | null
          category_id: string | null
          communication_quirks: string[] | null
          configuration_schema: Json | null
          created_at: string
          description: string | null
          guard_rails: Json | null
          id: string
          image_url: string | null
          interests: string[] | null
          is_chat_compatible: boolean | null
          is_system: boolean | null
          is_workflow_based: boolean | null
          long_description: string | null
          name: string
          opinion_tendencies: string | null
          personality_traits: Json | null
          price: number | null
          publisher_id: string | null
          rating: number | null
          required_credentials: Json | null
          response_timeout: number | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          short_description: string | null
          status: string | null
          supported_features: string[] | null
          total_installs: number | null
          total_reviews: number | null
          updated_at: string
          webhook_url: string | null
          workflow_file_path: string | null
          workflow_json: Json | null
        }
        Insert: {
          ai_instructions?: string | null
          ai_personality?: string | null
          api_authentication_type?: string | null
          capabilities?: string[] | null
          category_id?: string | null
          communication_quirks?: string[] | null
          configuration_schema?: Json | null
          created_at?: string
          description?: string | null
          guard_rails?: Json | null
          id?: string
          image_url?: string | null
          interests?: string[] | null
          is_chat_compatible?: boolean | null
          is_system?: boolean | null
          is_workflow_based?: boolean | null
          long_description?: string | null
          name: string
          opinion_tendencies?: string | null
          personality_traits?: Json | null
          price?: number | null
          publisher_id?: string | null
          rating?: number | null
          required_credentials?: Json | null
          response_timeout?: number | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          short_description?: string | null
          status?: string | null
          supported_features?: string[] | null
          total_installs?: number | null
          total_reviews?: number | null
          updated_at?: string
          webhook_url?: string | null
          workflow_file_path?: string | null
          workflow_json?: Json | null
        }
        Update: {
          ai_instructions?: string | null
          ai_personality?: string | null
          api_authentication_type?: string | null
          capabilities?: string[] | null
          category_id?: string | null
          communication_quirks?: string[] | null
          configuration_schema?: Json | null
          created_at?: string
          description?: string | null
          guard_rails?: Json | null
          id?: string
          image_url?: string | null
          interests?: string[] | null
          is_chat_compatible?: boolean | null
          is_system?: boolean | null
          is_workflow_based?: boolean | null
          long_description?: string | null
          name?: string
          opinion_tendencies?: string | null
          personality_traits?: Json | null
          price?: number | null
          publisher_id?: string | null
          rating?: number | null
          required_credentials?: Json | null
          response_timeout?: number | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          short_description?: string | null
          status?: string | null
          supported_features?: string[] | null
          total_installs?: number | null
          total_reviews?: number | null
          updated_at?: string
          webhook_url?: string | null
          workflow_file_path?: string | null
          workflow_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "agent_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          automation_id: string
          created_at: string | null
          error_message: string | null
          executed_at: string | null
          execution_time_ms: number | null
          id: string
          output_data: Json | null
          status: string
          task_id: string | null
        }
        Insert: {
          automation_id: string
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          output_data?: Json | null
          status: string
          task_id?: string | null
        }
        Update: {
          automation_id?: string
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          output_data?: Json | null
          status?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          action: string
          agent_id: string | null
          chain_order: number | null
          chat_id: string | null
          created_at: string
          created_by: string | null
          execution_output: Json | null
          id: string
          is_enabled: boolean | null
          last_executed_at: string | null
          last_execution_status: string | null
          last_run: string | null
          name: string
          next_run_at: string | null
          progress: number | null
          result_data: Json | null
          schedule_cron: string | null
          schedule_days: number[] | null
          schedule_interval_minutes: number | null
          schedule_time: string | null
          schedule_type: string | null
          status: string | null
          task_id: string | null
          timezone: string | null
          trigger: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          action: string
          agent_id?: string | null
          chain_order?: number | null
          chat_id?: string | null
          created_at?: string
          created_by?: string | null
          execution_output?: Json | null
          id?: string
          is_enabled?: boolean | null
          last_executed_at?: string | null
          last_execution_status?: string | null
          last_run?: string | null
          name: string
          next_run_at?: string | null
          progress?: number | null
          result_data?: Json | null
          schedule_cron?: string | null
          schedule_days?: number[] | null
          schedule_interval_minutes?: number | null
          schedule_time?: string | null
          schedule_type?: string | null
          status?: string | null
          task_id?: string | null
          timezone?: string | null
          trigger: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          action?: string
          agent_id?: string | null
          chain_order?: number | null
          chat_id?: string | null
          created_at?: string
          created_by?: string | null
          execution_output?: Json | null
          id?: string
          is_enabled?: boolean | null
          last_executed_at?: string | null
          last_execution_status?: string | null
          last_run?: string | null
          name?: string
          next_run_at?: string | null
          progress?: number | null
          result_data?: Json | null
          schedule_cron?: string | null
          schedule_days?: number[] | null
          schedule_interval_minutes?: number | null
          schedule_time?: string | null
          schedule_type?: string | null
          status?: string | null
          task_id?: string | null
          timezone?: string | null
          trigger?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brian_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          messages: Json | null
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brian_conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_agent_memories: {
        Row: {
          agent_installation_id: string | null
          category: string
          chat_id: string
          created_at: string
          created_by: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          agent_installation_id?: string | null
          category: string
          chat_id: string
          created_at?: string
          created_by: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          agent_installation_id?: string | null
          category?: string
          chat_id?: string
          created_at?: string
          created_by?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_agent_memories_agent_installation_id_fkey"
            columns: ["agent_installation_id"]
            isOneToOne: false
            referencedRelation: "agent_installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_agent_memories_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_agents: {
        Row: {
          added_at: string
          added_by: string | null
          agent_id: string
          chat_id: string
          id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          agent_id: string
          chat_id: string
          id?: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          agent_id?: string
          chat_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_agents_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          sender_type: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          sender_type: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          sender_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          installation_id: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          installation_id: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          installation_id?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "agent_installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          agent_id: string | null
          created_at: string
          created_by: string | null
          id: string
          last_activity: string
          name: string | null
          type: string
          workspace_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          last_activity?: string
          name?: string | null
          type: string
          workspace_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          last_activity?: string
          name?: string | null
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      developer_applications: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          skills: string[] | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          skills?: string[] | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          skills?: string[] | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          bundle_type: string | null
          category: string
          color: string | null
          company_name: string
          created_at: string | null
          credential_type: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_google_bundle: boolean | null
          logo_url: string
          name: string
          updated_at: string | null
        }
        Insert: {
          bundle_type?: string | null
          category: string
          color?: string | null
          company_name: string
          created_at?: string | null
          credential_type: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_google_bundle?: boolean | null
          logo_url: string
          name: string
          updated_at?: string | null
        }
        Update: {
          bundle_type?: string | null
          category?: string
          color?: string | null
          company_name?: string
          created_at?: string | null
          credential_type?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_google_bundle?: boolean | null
          logo_url?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          agent_id: string | null
          chat_id: string
          content: string
          created_at: string
          error_message: string | null
          id: string
          is_agent_to_agent: boolean | null
          metadata: Json | null
          processing_time_ms: number | null
          read: boolean | null
          response_metadata: Json | null
          target_agent_id: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          chat_id: string
          content: string
          created_at?: string
          error_message?: string | null
          id?: string
          is_agent_to_agent?: boolean | null
          metadata?: Json | null
          processing_time_ms?: number | null
          read?: boolean | null
          response_metadata?: Json | null
          target_agent_id?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          chat_id?: string
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          is_agent_to_agent?: boolean | null
          metadata?: Json | null
          processing_time_ms?: number | null
          read?: boolean | null
          response_metadata?: Json | null
          target_agent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_target_agent_id_fkey"
            columns: ["target_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_agent_id: string | null
          automation_count: number | null
          completed_at: string | null
          completed_automation_count: number | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_asap: boolean | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          automation_count?: number | null
          completed_at?: string | null
          completed_automation_count?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_asap?: boolean | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          automation_count?: number | null
          completed_at?: string | null
          completed_automation_count?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_asap?: boolean | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_agent_relationships: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          interaction_count: number | null
          last_interaction: string | null
          rapport_level: number | null
          shared_context: Json | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction?: string | null
          rapport_level?: number | null
          shared_context?: Json | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction?: string | null
          rapport_level?: number | null
          shared_context?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_agent_relationships_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credentials: {
        Row: {
          access_token: string
          account_email: string | null
          account_label: string | null
          bundle_type: string | null
          created_at: string
          credential_type: string
          expires_at: string | null
          id: string
          refresh_token: string | null
          scopes: string[] | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_email?: string | null
          account_label?: string | null
          bundle_type?: string | null
          created_at?: string
          credential_type: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_email?: string | null
          account_label?: string | null
          bundle_type?: string | null
          created_at?: string
          credential_type?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          use_case: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          use_case?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          use_case?: string | null
        }
        Relationships: []
      }
      workspace_agent_memories: {
        Row: {
          agent_installation_id: string | null
          category: string
          created_at: string
          created_by: string
          id: string
          key: string
          updated_at: string
          value: string
          workspace_id: string
        }
        Insert: {
          agent_installation_id?: string | null
          category: string
          created_at?: string
          created_by: string
          id?: string
          key: string
          updated_at?: string
          value: string
          workspace_id: string
        }
        Update: {
          agent_installation_id?: string | null
          category?: string
          created_at?: string
          created_by?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_agent_memories_agent_installation_id_fkey"
            columns: ["agent_installation_id"]
            isOneToOne: false
            referencedRelation: "agent_installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_agent_memories_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_documents: {
        Row: {
          created_at: string
          description: string | null
          extracted_content: string | null
          file_path: string
          file_size: number
          file_type: string
          folder: string | null
          id: string
          name: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          extracted_content?: string | null
          file_path: string
          file_size: number
          file_type: string
          folder?: string | null
          id?: string
          name: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          extracted_content?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          folder?: string | null
          id?: string
          name?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_knowledge: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string
          id: string
          search_vector: unknown
          tags: string[] | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          search_vector?: unknown
          tags?: string[] | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          search_vector?: unknown
          tags?: string[] | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_knowledge_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          role: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_weekly_run: {
        Args: { days: number[]; run_time: string }
        Returns: string
      }
      get_user_workspace_ids: {
        Args: { _user_id: string }
        Returns: {
          workspace_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_chat_participant: {
        Args: { _chat_id: string; _user_id: string }
        Returns: boolean
      }
      mark_messages_read: {
        Args: { p_chat_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
