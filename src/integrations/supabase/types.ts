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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_name: string
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages_v2: {
        Row: {
          content: string
          created_at: string
          id: string
          mentions: string[] | null
          metadata: Json | null
          parent_message_id: string | null
          role: string
          session_id: string
          thread_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          metadata?: Json | null
          parent_message_id?: string | null
          role: string
          session_id: string
          thread_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          metadata?: Json | null
          parent_message_id?: string | null
          role?: string
          session_id?: string
          thread_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_v2_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_v2_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions_v2: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_v2_workspace_id_fkey"
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
      conversation_summaries: {
        Row: {
          created_at: string | null
          embedding: string | null
          id: string
          key_topics: string[] | null
          message_count: number | null
          session_id: string
          summary: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          key_topics?: string[] | null
          message_count?: number | null
          session_id: string
          summary: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          key_topics?: string[] | null
          message_count?: number | null
          session_id?: string
          summary?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      credentials: {
        Row: {
          created_at: string
          encrypted_blob_ref: string | null
          id: string
          org_id: string
          provider: string
          rotated_at: string | null
          vault_ref: string | null
        }
        Insert: {
          created_at?: string
          encrypted_blob_ref?: string | null
          id?: string
          org_id: string
          provider: string
          rotated_at?: string | null
          vault_ref?: string | null
        }
        Update: {
          created_at?: string
          encrypted_blob_ref?: string | null
          id?: string
          org_id?: string
          provider?: string
          rotated_at?: string | null
          vault_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credentials_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          created_at: string
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body_html: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          auth_type: string | null
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
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          auth_type?: string | null
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
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_type?: string | null
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
          slug?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mcp_tokens: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          label: string
          last_used_at: string | null
          org_id: string | null
          revoked_at: string | null
          scopes: string[] | null
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          label: string
          last_used_at?: string | null
          org_id?: string | null
          revoked_at?: string | null
          scopes?: string[] | null
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          label?: string
          last_used_at?: string | null
          org_id?: string | null
          revoked_at?: string | null
          scopes?: string[] | null
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcp_tokens_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
          org_id: string | null
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          org_id?: string | null
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          org_id?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      org_integrations: {
        Row: {
          connected_at: string | null
          credential_id: string | null
          external_account_id: string | null
          id: string
          integration_id: string
          org_id: string
          scopes: string[] | null
          status: Database["public"]["Enums"]["integration_status"]
          updated_at: string
        }
        Insert: {
          connected_at?: string | null
          credential_id?: string | null
          external_account_id?: string | null
          id?: string
          integration_id: string
          org_id: string
          scopes?: string[] | null
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Update: {
          connected_at?: string | null
          credential_id?: string | null
          external_account_id?: string | null
          id?: string
          integration_id?: string
          org_id?: string
          scopes?: string[] | null
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_org_integrations_credential"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_integrations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      org_settings: {
        Row: {
          ai_allowed_tools: string[]
          ai_auto_approve_read: boolean
          ai_auto_approve_write: boolean
          ai_paused: boolean | null
          ai_response_style: string
          ai_restricted_tools: string[]
          auto_approved_tools: string[] | null
          created_at: string
          id: string
          max_ai_calls_per_day: number | null
          org_id: string
          require_approval_for_external: boolean
          updated_at: string
        }
        Insert: {
          ai_allowed_tools?: string[]
          ai_auto_approve_read?: boolean
          ai_auto_approve_write?: boolean
          ai_paused?: boolean | null
          ai_response_style?: string
          ai_restricted_tools?: string[]
          auto_approved_tools?: string[] | null
          created_at?: string
          id?: string
          max_ai_calls_per_day?: number | null
          org_id: string
          require_approval_for_external?: boolean
          updated_at?: string
        }
        Update: {
          ai_allowed_tools?: string[]
          ai_auto_approve_read?: boolean
          ai_auto_approve_write?: boolean
          ai_paused?: boolean | null
          ai_response_style?: string
          ai_restricted_tools?: string[]
          auto_approved_tools?: string[] | null
          created_at?: string
          id?: string
          max_ai_calls_per_day?: number | null
          org_id?: string
          require_approval_for_external?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: string
        }
        Relationships: []
      }
      pending_actions: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          org_id: string | null
          parameters: Json
          resolved_at: string | null
          result: Json | null
          session_id: string
          status: string | null
          tool_display_name: string | null
          tool_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          org_id?: string | null
          parameters?: Json
          resolved_at?: string | null
          result?: Json | null
          session_id: string
          status?: string | null
          tool_display_name?: string | null
          tool_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          org_id?: string | null
          parameters?: Json
          resolved_at?: string | null
          result?: Json | null
          session_id?: string
          status?: string | null
          tool_display_name?: string | null
          tool_name?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          org_id: string
          role?: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
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
          ai_context: string | null
          ai_tools_allowed: string[] | null
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          last_run_at: string | null
          last_scheduled_run: string | null
          next_scheduled_run: string | null
          position: number | null
          priority: string | null
          schedule: string | null
          scheduled_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_context?: string | null
          ai_tools_allowed?: string[] | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          last_run_at?: string | null
          last_scheduled_run?: string | null
          next_scheduled_run?: string | null
          position?: number | null
          priority?: string | null
          schedule?: string | null
          scheduled_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_context?: string | null
          ai_tools_allowed?: string[] | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          last_run_at?: string | null
          last_scheduled_run?: string | null
          next_scheduled_run?: string | null
          position?: number | null
          priority?: string | null
          schedule?: string | null
          scheduled_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_calls: {
        Row: {
          actor_token_id: string | null
          actor_user_id: string | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input: Json | null
          integration_slug: string
          latency_ms: number | null
          org_id: string | null
          output: Json | null
          status: string | null
          tool_name: string
          user_id: string
        }
        Insert: {
          actor_token_id?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input?: Json | null
          integration_slug: string
          latency_ms?: number | null
          org_id?: string | null
          output?: Json | null
          status?: string | null
          tool_name: string
          user_id: string
        }
        Update: {
          actor_token_id?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input?: Json | null
          integration_slug?: string
          latency_ms?: number | null
          org_id?: string | null
          output?: Json | null
          status?: string | null
          tool_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_calls_actor_token_id_fkey"
            columns: ["actor_token_id"]
            isOneToOne: false
            referencedRelation: "mcp_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_calls_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_execution_log: {
        Row: {
          chat_id: string | null
          created_at: string | null
          credential_type: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_summary: string | null
          output_summary: string | null
          success: boolean
          tool_name: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          chat_id?: string | null
          created_at?: string | null
          credential_type?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_summary?: string | null
          output_summary?: string | null
          success?: boolean
          tool_name: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          chat_id?: string | null
          created_at?: string | null
          credential_type?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_summary?: string | null
          output_summary?: string | null
          success?: boolean
          tool_name?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_execution_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_scope_requirements: {
        Row: {
          created_at: string | null
          credential_type: string
          id: string
          required_scopes: string[]
          tool_name: string
        }
        Insert: {
          created_at?: string | null
          credential_type: string
          id?: string
          required_scopes?: string[]
          tool_name: string
        }
        Update: {
          created_at?: string | null
          credential_type?: string
          id?: string
          required_scopes?: string[]
          tool_name?: string
        }
        Relationships: []
      }
      usage_stats: {
        Row: {
          ai_calls: number | null
          created_at: string | null
          documents_uploaded: number | null
          id: string
          month: string
          org_id: string | null
          storage_bytes_used: number | null
          tool_executions: number | null
          updated_at: string | null
        }
        Insert: {
          ai_calls?: number | null
          created_at?: string | null
          documents_uploaded?: number | null
          id?: string
          month: string
          org_id?: string | null
          storage_bytes_used?: number | null
          tool_executions?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_calls?: number | null
          created_at?: string | null
          documents_uploaded?: number | null
          id?: string
          month?: string
          org_id?: string | null
          storage_bytes_used?: number | null
          tool_executions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_stats_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
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
          encrypted_access_token: string | null
          encrypted_refresh_token: string | null
          expires_at: string | null
          id: string
          is_encrypted: boolean | null
          last_used_at: string | null
          refresh_token: string | null
          scopes: string[] | null
          token_type: string | null
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          access_token: string
          account_email?: string | null
          account_label?: string | null
          bundle_type?: string | null
          created_at?: string
          credential_type: string
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          expires_at?: string | null
          id?: string
          is_encrypted?: boolean | null
          last_used_at?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          access_token?: string
          account_email?: string | null
          account_label?: string | null
          bundle_type?: string | null
          created_at?: string
          credential_type?: string
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          expires_at?: string | null
          id?: string
          is_encrypted?: boolean | null
          last_used_at?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
          usage_count?: number | null
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
      workspace_documents: {
        Row: {
          created_at: string | null
          embedding: string | null
          extracted_content: string | null
          file_path: string
          file_size: number
          file_type: string
          id: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          extracted_content?: string | null
          file_path: string
          file_size: number
          file_type: string
          id?: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          extracted_content?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
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
      check_duplicate_invite: {
        Args: { recipient_email: string; sender_email: string }
        Returns: boolean
      }
      check_invite_rate_limit: {
        Args: { sender_email: string }
        Returns: boolean
      }
      generate_referral_code: { Args: never; Returns: string }
      get_referral_leaderboard: {
        Args: { limit_count?: number }
        Returns: Json
      }
      get_referral_stats: { Args: { user_email: string }; Returns: Json }
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
      increment_invites_sent: {
        Args: { user_email: string }
        Returns: undefined
      }
      is_chat_participant: {
        Args: { _chat_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_admin: { Args: { _org_id: string }; Returns: boolean }
      is_org_member: { Args: { _org_id: string }; Returns: boolean }
      mark_messages_read: {
        Args: { p_chat_id: string; p_user_id: string }
        Returns: undefined
      }
      match_conversation_memories: {
        Args: {
          match_count?: number
          match_threshold?: number
          match_user_id: string
          query_embedding: string
        }
        Returns: {
          created_at: string
          id: string
          key_topics: string[]
          session_id: string
          similarity: number
          summary: string
        }[]
      }
      match_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_workspace_id?: string
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
      record_invite: {
        Args: { recipient_email: string; sender_email: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      integration_status: "connected" | "disconnected" | "error"
      org_role: "owner" | "admin" | "member"
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
      integration_status: ["connected", "disconnected", "error"],
      org_role: ["owner", "admin", "member"],
    },
  },
} as const
