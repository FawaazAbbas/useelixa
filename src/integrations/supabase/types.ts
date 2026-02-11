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
      admin_audit_log: {
        Row: {
          action_type: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          org_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_actions: {
        Row: {
          action_name: string
          agent_id: string
          created_at: string | null
          description: string | null
          id: string
          method: string
          path: string
          request_schema: Json | null
          response_schema: Json | null
          sort_order: number | null
        }
        Insert: {
          action_name: string
          agent_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          method?: string
          path: string
          request_schema?: Json | null
          response_schema?: Json | null
          sort_order?: number | null
        }
        Update: {
          action_name?: string
          agent_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          method?: string
          path?: string
          request_schema?: Json | null
          response_schema?: Json | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_actions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_execution_logs: {
        Row: {
          agent_id: string
          created_at: string
          developer_id: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_message: string | null
          output_response: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          developer_id: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_message?: string | null
          output_response?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          developer_id?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_message?: string | null
          output_response?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_execution_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_execution_logs_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_installations: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_active: boolean
          permissions: Json
          requires_approval: boolean
          risk_tier: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          requires_approval?: boolean
          risk_tier?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          requires_approval?: boolean
          risk_tier?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_installations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_submissions"
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
      agent_proposals: {
        Row: {
          created_at: string
          data: Json
          id: string
          installation_id: string
          request_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          installation_id: string
          request_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          installation_id?: string
          request_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_proposals_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "agent_installations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_submissions: {
        Row: {
          allowed_tools: string[] | null
          capability_manifest: Json | null
          category: string | null
          code_file_url: string | null
          config_file_url: string | null
          created_at: string
          description: string | null
          developer_id: string
          download_count: number
          endpoint_auth_type: string | null
          endpoint_base_url: string | null
          endpoint_health_path: string | null
          endpoint_invoke_path: string | null
          endpoint_secret: string | null
          entry_function: string | null
          execution_error: string | null
          execution_mode: string
          execution_status: string
          external_auth_header: string | null
          external_auth_token: string | null
          external_endpoint_url: string | null
          hosting_type: string
          icon_url: string | null
          id: string
          input_schema: Json | null
          is_public: boolean
          name: string
          output_schema: Json | null
          requirements: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          runtime: string
          slug: string
          status: string
          submitted_at: string | null
          system_prompt: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          allowed_tools?: string[] | null
          capability_manifest?: Json | null
          category?: string | null
          code_file_url?: string | null
          config_file_url?: string | null
          created_at?: string
          description?: string | null
          developer_id: string
          download_count?: number
          endpoint_auth_type?: string | null
          endpoint_base_url?: string | null
          endpoint_health_path?: string | null
          endpoint_invoke_path?: string | null
          endpoint_secret?: string | null
          entry_function?: string | null
          execution_error?: string | null
          execution_mode?: string
          execution_status?: string
          external_auth_header?: string | null
          external_auth_token?: string | null
          external_endpoint_url?: string | null
          hosting_type?: string
          icon_url?: string | null
          id?: string
          input_schema?: Json | null
          is_public?: boolean
          name: string
          output_schema?: Json | null
          requirements?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          runtime?: string
          slug: string
          status?: string
          submitted_at?: string | null
          system_prompt?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          allowed_tools?: string[] | null
          capability_manifest?: Json | null
          category?: string | null
          code_file_url?: string | null
          config_file_url?: string | null
          created_at?: string
          description?: string | null
          developer_id?: string
          download_count?: number
          endpoint_auth_type?: string | null
          endpoint_base_url?: string | null
          endpoint_health_path?: string | null
          endpoint_invoke_path?: string | null
          endpoint_secret?: string | null
          entry_function?: string | null
          execution_error?: string | null
          execution_mode?: string
          execution_status?: string
          external_auth_header?: string | null
          external_auth_token?: string | null
          external_endpoint_url?: string | null
          hosting_type?: string
          icon_url?: string | null
          id?: string
          input_schema?: Json | null
          is_public?: boolean
          name?: string
          output_schema?: Json | null
          requirements?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          runtime?: string
          slug?: string
          status?: string
          submitted_at?: string | null
          system_prompt?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_submissions_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_employee_messages: {
        Row: {
          content: string
          created_at: string | null
          from_employee_id: string | null
          id: string
          initiated_by_user: string | null
          message_type: string | null
          metadata: Json | null
          parent_task_id: string | null
          to_employee_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          from_employee_id?: string | null
          id?: string
          initiated_by_user?: string | null
          message_type?: string | null
          metadata?: Json | null
          parent_task_id?: string | null
          to_employee_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          from_employee_id?: string | null
          id?: string
          initiated_by_user?: string | null
          message_type?: string | null
          metadata?: Json | null
          parent_task_id?: string | null
          to_employee_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_employee_messages_from_employee_id_fkey"
            columns: ["from_employee_id"]
            isOneToOne: false
            referencedRelation: "ai_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_employee_messages_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_employee_messages_to_employee_id_fkey"
            columns: ["to_employee_id"]
            isOneToOne: false
            referencedRelation: "ai_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_employee_tasks: {
        Row: {
          assigned_by_user: string | null
          completed_at: string | null
          created_at: string | null
          delegated_by_employee_id: string | null
          employee_id: string | null
          id: string
          original_task_id: string | null
          priority: string | null
          result: string | null
          result_metadata: Json | null
          started_at: string | null
          status: string | null
          task_description: string
        }
        Insert: {
          assigned_by_user?: string | null
          completed_at?: string | null
          created_at?: string | null
          delegated_by_employee_id?: string | null
          employee_id?: string | null
          id?: string
          original_task_id?: string | null
          priority?: string | null
          result?: string | null
          result_metadata?: Json | null
          started_at?: string | null
          status?: string | null
          task_description: string
        }
        Update: {
          assigned_by_user?: string | null
          completed_at?: string | null
          created_at?: string | null
          delegated_by_employee_id?: string | null
          employee_id?: string | null
          id?: string
          original_task_id?: string | null
          priority?: string | null
          result?: string | null
          result_metadata?: Json | null
          started_at?: string | null
          status?: string | null
          task_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_employee_tasks_delegated_by_employee_id_fkey"
            columns: ["delegated_by_employee_id"]
            isOneToOne: false
            referencedRelation: "ai_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_employee_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "ai_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_employee_tasks_original_task_id_fkey"
            columns: ["original_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_employees: {
        Row: {
          allowed_tools: string[] | null
          avatar_url: string | null
          can_delegate_to: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_template: boolean | null
          name: string
          org_id: string | null
          role: string
          system_prompt: string | null
          updated_at: string | null
        }
        Insert: {
          allowed_tools?: string[] | null
          avatar_url?: string | null
          can_delegate_to?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name: string
          org_id?: string | null
          role: string
          system_prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          allowed_tools?: string[] | null
          avatar_url?: string | null
          can_delegate_to?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name?: string
          org_id?: string | null
          role?: string
          system_prompt?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_employees_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
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
      chat_folders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
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
          folder_id: string | null
          id: string
          is_pinned: boolean
          selected_model: string | null
          title: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          is_pinned?: boolean
          selected_model?: string | null
          title?: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          is_pinned?: boolean
          selected_model?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_v2_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "chat_folders"
            referencedColumns: ["id"]
          },
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
      credit_packages: {
        Row: {
          created_at: string | null
          credits: number
          id: string
          name: string
          popular: boolean | null
          price_cents: number
        }
        Insert: {
          created_at?: string | null
          credits: number
          id?: string
          name: string
          popular?: boolean | null
          price_cents: number
        }
        Update: {
          created_at?: string | null
          credits?: number
          id?: string
          name?: string
          popular?: boolean | null
          price_cents?: number
        }
        Relationships: []
      }
      credit_pricing: {
        Row: {
          created_at: string | null
          credit_increment: number
          currency: string
          id: string
          max_credits: number
          min_credits: number
          price_per_credit_pence: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_increment?: number
          currency?: string
          id?: string
          max_credits?: number
          min_credits?: number
          price_per_credit_pence?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_increment?: number
          currency?: string
          id?: string
          max_credits?: number
          min_credits?: number
          price_per_credit_pence?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_digests: {
        Row: {
          content: Json
          delivered_at: string | null
          delivery_method: string | null
          digest_date: string
          generated_at: string | null
          id: string
          summary: string | null
          user_id: string | null
        }
        Insert: {
          content: Json
          delivered_at?: string | null
          delivery_method?: string | null
          digest_date: string
          generated_at?: string | null
          id?: string
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          content?: Json
          delivered_at?: string | null
          delivery_method?: string | null
          digest_date?: string
          generated_at?: string | null
          id?: string
          summary?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      developer_profiles: {
        Row: {
          company_name: string | null
          created_at: string
          developer_bio: string | null
          id: string
          is_verified: boolean
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          developer_bio?: string | null
          id?: string
          is_verified?: boolean
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          developer_bio?: string | null
          id?: string
          is_verified?: boolean
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      digest_configs: {
        Row: {
          created_at: string | null
          delivery_time: string | null
          email_delivery: boolean | null
          id: string
          include_ai_suggestions: boolean | null
          include_calendar: boolean | null
          include_emails: boolean | null
          include_metrics: boolean | null
          include_tasks: boolean | null
          is_enabled: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_time?: string | null
          email_delivery?: boolean | null
          id?: string
          include_ai_suggestions?: boolean | null
          include_calendar?: boolean | null
          include_emails?: boolean | null
          include_metrics?: boolean | null
          include_tasks?: boolean | null
          is_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_time?: string | null
          email_delivery?: boolean | null
          id?: string
          include_ai_suggestions?: boolean | null
          include_calendar?: boolean | null
          include_emails?: boolean | null
          include_metrics?: boolean | null
          include_tasks?: boolean | null
          is_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      message_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_pinned: boolean | null
          title: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          title?: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
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
          connector_limit: number | null
          created_at: string
          has_premium_models: boolean | null
          id: string
          is_unlimited: boolean | null
          monthly_credits: number | null
          name: string
          plan: string
          plan_started_at: string | null
          trial_ends_at: string | null
        }
        Insert: {
          connector_limit?: number | null
          created_at?: string
          has_premium_models?: boolean | null
          id?: string
          is_unlimited?: boolean | null
          monthly_credits?: number | null
          name: string
          plan?: string
          plan_started_at?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          connector_limit?: number | null
          created_at?: string
          has_premium_models?: boolean | null
          id?: string
          is_unlimited?: boolean | null
          monthly_credits?: number | null
          name?: string
          plan?: string
          plan_started_at?: string | null
          trial_ends_at?: string | null
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
      reasoning_traces: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          decision_summary: string | null
          employee_id: string | null
          id: string
          message_id: string | null
          model_used: string | null
          reasoning_steps: Json
          task_id: string | null
          tools_considered: string[] | null
          tools_used: string[] | null
          total_tokens: number | null
          user_id: string | null
          workflow_execution_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          decision_summary?: string | null
          employee_id?: string | null
          id?: string
          message_id?: string | null
          model_used?: string | null
          reasoning_steps?: Json
          task_id?: string | null
          tools_considered?: string[] | null
          tools_used?: string[] | null
          total_tokens?: number | null
          user_id?: string | null
          workflow_execution_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          decision_summary?: string | null
          employee_id?: string | null
          id?: string
          message_id?: string | null
          model_used?: string | null
          reasoning_steps?: Json
          task_id?: string | null
          tools_considered?: string[] | null
          tools_used?: string[] | null
          total_tokens?: number | null
          user_id?: string | null
          workflow_execution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reasoning_traces_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "ai_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reasoning_traces_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reasoning_traces_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reasoning_traces_workflow_execution_id_fkey"
            columns: ["workflow_execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_chats: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_public: boolean | null
          session_id: string
          share_token: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          session_id: string
          share_token?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          session_id?: string
          share_token?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_chats_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions_v2"
            referencedColumns: ["id"]
          },
        ]
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
          is_recurring: boolean | null
          last_run_at: string | null
          last_scheduled_run: string | null
          next_scheduled_run: string | null
          position: number | null
          priority: string | null
          recurrence_pattern: string | null
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
          is_recurring?: boolean | null
          last_run_at?: string | null
          last_scheduled_run?: string | null
          next_scheduled_run?: string | null
          position?: number | null
          priority?: string | null
          recurrence_pattern?: string | null
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
          is_recurring?: boolean | null
          last_run_at?: string | null
          last_scheduled_run?: string | null
          next_scheduled_run?: string | null
          position?: number | null
          priority?: string | null
          recurrence_pattern?: string | null
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
          credits_purchased: number | null
          credits_used: number | null
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
          credits_purchased?: number | null
          credits_used?: number | null
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
          credits_purchased?: number | null
          credits_used?: number | null
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
          access_token: string | null
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
          access_token?: string | null
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
          access_token?: string | null
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
      user_memories: {
        Row: {
          category: string | null
          created_at: string
          id: string
          memory_key: string
          memory_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          memory_key: string
          memory_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          memory_key?: string
          memory_value?: string
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
      workflow_executions: {
        Row: {
          completed_at: string | null
          current_step_id: string | null
          error_message: string | null
          id: string
          started_at: string | null
          status: string | null
          step_results: Json | null
          triggered_by: string | null
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          current_step_id?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          step_results?: Json | null
          triggered_by?: string | null
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          current_step_id?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          step_results?: Json | null
          triggered_by?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          condition_config: Json | null
          created_at: string | null
          id: string
          on_failure_step_id: string | null
          on_success_step_id: string | null
          position_x: number | null
          position_y: number | null
          step_name: string | null
          step_order: number
          step_type: string
          tool_name: string | null
          tool_params: Json | null
          workflow_id: string | null
        }
        Insert: {
          condition_config?: Json | null
          created_at?: string | null
          id?: string
          on_failure_step_id?: string | null
          on_success_step_id?: string | null
          position_x?: number | null
          position_y?: number | null
          step_name?: string | null
          step_order: number
          step_type: string
          tool_name?: string | null
          tool_params?: Json | null
          workflow_id?: string | null
        }
        Update: {
          condition_config?: Json | null
          created_at?: string | null
          id?: string
          on_failure_step_id?: string | null
          on_success_step_id?: string | null
          position_x?: number | null
          position_y?: number | null
          step_name?: string | null
          step_order?: number
          step_type?: string
          tool_name?: string | null
          tool_params?: Json | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string | null
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id?: string | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "moderator" | "user" | "developer"
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
      app_role: ["admin", "moderator", "user", "developer"],
      integration_status: ["connected", "disconnected", "error"],
      org_role: ["owner", "admin", "member"],
    },
  },
} as const
