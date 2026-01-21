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
      admin_alert_email_config: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          name: string | null
          notify_critical: boolean | null
          notify_info: boolean | null
          notify_warning: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string | null
          notify_critical?: boolean | null
          notify_info?: boolean | null
          notify_warning?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string | null
          notify_critical?: boolean | null
          notify_info?: boolean | null
          notify_warning?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_alert_occurrences: {
        Row: {
          alert_type: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_resolved: boolean
          message: string
          resolved_at: string | null
          resolved_by: string | null
          rule_id: string
          severity: string
          title: string | null
        }
        Insert: {
          alert_type?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_resolved?: boolean
          message: string
          resolved_at?: string | null
          resolved_by?: string | null
          rule_id: string
          severity?: string
          title?: string | null
        }
        Update: {
          alert_type?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_resolved?: boolean
          message?: string
          resolved_at?: string | null
          resolved_by?: string | null
          rule_id?: string
          severity?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_alert_occurrences_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "admin_alert_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_alert_rules: {
        Row: {
          alert_type: string
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          severity: string
          threshold_unit: string | null
          threshold_value: number | null
          updated_at: string
        }
        Insert: {
          alert_type: string
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          severity?: string
          threshold_unit?: string | null
          threshold_value?: number | null
          updated_at?: string
        }
        Update: {
          alert_type?: string
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          severity?: string
          threshold_unit?: string | null
          threshold_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_dashboard_layouts: {
        Row: {
          admin_id: string
          favorite_metrics: string[] | null
          grid_columns: number | null
          id: string
          layout_config: Json
          updated_at: string
        }
        Insert: {
          admin_id: string
          favorite_metrics?: string[] | null
          grid_columns?: number | null
          id?: string
          layout_config?: Json
          updated_at?: string
        }
        Update: {
          admin_id?: string
          favorite_metrics?: string[] | null
          grid_columns?: number | null
          id?: string
          layout_config?: Json
          updated_at?: string
        }
        Relationships: []
      }
      admin_insights: {
        Row: {
          created_at: string
          description: string
          id: string
          insight_type: string
          is_dismissed: boolean | null
          is_read: boolean | null
          metadata: Json | null
          severity: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          insight_type: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          severity?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          insight_type?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          severity?: string | null
          title?: string
        }
        Relationships: []
      }
      admin_notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          notify_community_posts: boolean | null
          notify_course_completions: boolean | null
          notify_new_enrollments: boolean | null
          notify_new_leads: boolean | null
          notify_new_students: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          notify_community_posts?: boolean | null
          notify_course_completions?: boolean | null
          notify_new_enrollments?: boolean | null
          notify_new_leads?: boolean | null
          notify_new_students?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          notify_community_posts?: boolean | null
          notify_course_completions?: boolean | null
          notify_new_enrollments?: boolean | null
          notify_new_leads?: boolean | null
          notify_new_students?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          can_manage_admins: boolean | null
          can_manage_courses: boolean | null
          can_manage_enrollments: boolean | null
          can_manage_leads: boolean | null
          can_manage_students: boolean | null
          can_send_notifications: boolean | null
          can_view_reports: boolean | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_manage_admins?: boolean | null
          can_manage_courses?: boolean | null
          can_manage_enrollments?: boolean | null
          can_manage_leads?: boolean | null
          can_manage_students?: boolean | null
          can_send_notifications?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_manage_admins?: boolean | null
          can_manage_courses?: boolean | null
          can_manage_enrollments?: boolean | null
          can_manage_leads?: boolean | null
          can_manage_students?: boolean | null
          can_send_notifications?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_student_notes: {
        Row: {
          admin_user_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          student_user_id: string
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          student_user_id: string
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          student_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_tags: {
        Row: {
          color: string
          created_at: string
          entity_type: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          entity_type: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          entity_type?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      admin_tasks: {
        Row: {
          assigned_to: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          related_lead_id: string | null
          related_student_id: string | null
          reminder_at: string | null
          reminder_sent: boolean
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date: string
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          related_lead_id?: string | null
          related_student_id?: string | null
          reminder_at?: string | null
          reminder_sent?: boolean
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          related_lead_id?: string | null
          related_student_id?: string | null
          reminder_at?: string | null
          reminder_sent?: boolean
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_tasks_related_lead_id_fkey"
            columns: ["related_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_tasks_related_student_id_fkey"
            columns: ["related_student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_agent_access: {
        Row: {
          agent_id: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_access_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          category_id: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          display_order: number | null
          external_url: string
          full_description: string | null
          icon: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          objective: string | null
          slug: string
          thumbnail_position: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          display_order?: number | null
          external_url: string
          full_description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          objective?: string | null
          slug: string
          thumbnail_position?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          display_order?: number | null
          external_url?: string
          full_description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          objective?: string | null
          slug?: string
          thumbnail_position?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_history: {
        Row: {
          content: string
          context_id: string | null
          context_type: string | null
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      blog_analytics: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          page_views: number | null
          post_id: string
          referrer: string | null
          time_on_page_seconds: number | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          page_views?: number | null
          post_id: string
          referrer?: string | null
          time_on_page_seconds?: number | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          page_views?: number | null
          post_id?: string
          referrer?: string | null
          time_on_page_seconds?: number | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string
          completion_date: string
          course_id: string
          course_title: string
          id: string
          issued_at: string
          student_name: string
          user_id: string
        }
        Insert: {
          certificate_number: string
          completion_date?: string
          course_id: string
          course_title: string
          id?: string
          issued_at?: string
          student_name: string
          user_id: string
        }
        Update: {
          certificate_number?: string
          completion_date?: string
          course_id?: string
          course_title?: string
          id?: string
          issued_at?: string
          student_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_history: {
        Row: {
          channel: string
          id: string
          message: string
          metadata: Json | null
          recipient_email: string | null
          recipient_id: string
          recipient_name: string | null
          recipient_phone: string | null
          recipient_type: string
          sent_at: string | null
          sent_by: string | null
          status: string | null
          subject: string | null
          template_id: string | null
        }
        Insert: {
          channel: string
          id?: string
          message: string
          metadata?: Json | null
          recipient_email?: string | null
          recipient_id: string
          recipient_name?: string | null
          recipient_phone?: string | null
          recipient_type: string
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          channel?: string
          id?: string
          message?: string
          metadata?: Json | null
          recipient_email?: string | null
          recipient_id?: string
          recipient_name?: string | null
          recipient_phone?: string | null
          recipient_type?: string
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_hidden: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_mentions: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          mentioned_user_id: string
          mentioner_user_id: string
          post_id: string | null
          read: boolean | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          mentioned_user_id: string
          mentioner_user_id: string
          post_id?: string | null
          read?: boolean | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          mentioned_user_id?: string
          mentioner_user_id?: string
          post_id?: string | null
          read?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "community_mentions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_poll_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_hidden: boolean | null
          is_highlighted: boolean | null
          is_official: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          moderated_at: string | null
          moderated_by: string | null
          poll_options: Json | null
          poll_question: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_hidden?: boolean | null
          is_highlighted?: boolean | null
          is_official?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          poll_options?: Json | null
          poll_question?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_hidden?: boolean | null
          is_highlighted?: boolean | null
          is_official?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          poll_options?: Json | null
          poll_question?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      course_gamification: {
        Row: {
          badges_earned: string[] | null
          course_id: string
          created_at: string | null
          current_title: string | null
          id: string
          level: number | null
          missions_completed: number | null
          updated_at: string | null
          user_id: string
          week_progress: number | null
          xp: number | null
        }
        Insert: {
          badges_earned?: string[] | null
          course_id: string
          created_at?: string | null
          current_title?: string | null
          id?: string
          level?: number | null
          missions_completed?: number | null
          updated_at?: string | null
          user_id: string
          week_progress?: number | null
          xp?: number | null
        }
        Update: {
          badges_earned?: string[] | null
          course_id?: string
          created_at?: string | null
          current_title?: string | null
          id?: string
          level?: number | null
          missions_completed?: number | null
          updated_at?: string | null
          user_id?: string
          week_progress?: number | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_gamification_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          calendar_link: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          duration_weeks: number | null
          id: string
          is_free: boolean
          is_published: boolean | null
          is_subscription: boolean | null
          price: number | null
          program_type: Database["public"]["Enums"]["program_type"] | null
          requires_diagnostic: boolean | null
          thumbnail_position: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          welcome_video_duration: number | null
          welcome_video_url: string | null
        }
        Insert: {
          calendar_link?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_free?: boolean
          is_published?: boolean | null
          is_subscription?: boolean | null
          price?: number | null
          program_type?: Database["public"]["Enums"]["program_type"] | null
          requires_diagnostic?: boolean | null
          thumbnail_position?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          welcome_video_duration?: number | null
          welcome_video_url?: string | null
        }
        Update: {
          calendar_link?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_free?: boolean
          is_published?: boolean | null
          is_subscription?: boolean | null
          price?: number | null
          program_type?: Database["public"]["Enums"]["program_type"] | null
          requires_diagnostic?: boolean | null
          thumbnail_position?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          welcome_video_duration?: number | null
          welcome_video_url?: string | null
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          badge_reward_id: string | null
          challenge_type: string
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          requirement_type: string
          requirement_value: number
          starts_at: string | null
          title: string
          xp_reward: number
        }
        Insert: {
          badge_reward_id?: string | null
          challenge_type: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          requirement_type: string
          requirement_value?: number
          starts_at?: string | null
          title: string
          xp_reward?: number
        }
        Update: {
          badge_reward_id?: string | null
          challenge_type?: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          requirement_type?: string
          requirement_value?: number
          starts_at?: string | null
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_badge_reward_id_fkey"
            columns: ["badge_reward_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_history: {
        Row: {
          change_type: string | null
          changed_at: string
          changed_fields: Json
          diagnostic_id: string
          id: string
          user_id: string
        }
        Insert: {
          change_type?: string | null
          changed_at?: string
          changed_fields: Json
          diagnostic_id: string
          id?: string
          user_id: string
        }
        Update: {
          change_type?: string | null
          changed_at?: string
          changed_fields?: Json
          diagnostic_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ebook_downloads: {
        Row: {
          downloaded_at: string
          ebook_name: string
          email: string
          id: string
          lead_id: string | null
        }
        Insert: {
          downloaded_at?: string
          ebook_name: string
          email: string
          id?: string
          lead_id?: string | null
        }
        Update: {
          downloaded_at?: string
          ebook_name?: string
          email?: string
          id?: string
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ebook_downloads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          expires_at: string | null
          id: string
          payment_id: string | null
          payment_source: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_source?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_tags: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "admin_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_rules: {
        Row: {
          channel: string
          created_at: string
          days_without_contact: number
          description: string | null
          id: string
          is_active: boolean
          name: string
          target_status: string[] | null
          target_temperature: string[] | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          channel?: string
          created_at?: string
          days_without_contact?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          target_status?: string[] | null
          target_temperature?: string[] | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          days_without_contact?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          target_status?: string[] | null
          target_temperature?: string[] | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      jornada_access: {
        Row: {
          access_token: string | null
          created_at: string | null
          email: string
          granted_at: string | null
          id: string
          jornada_slug: string
          last_accessed_at: string | null
          lead_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          email: string
          granted_at?: string | null
          id?: string
          jornada_slug?: string
          last_accessed_at?: string | null
          lead_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          email?: string
          granted_at?: string | null
          id?: string
          jornada_slug?: string
          last_accessed_at?: string | null
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jornada_access_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      jornada_notification_queue: {
        Row: {
          created_at: string | null
          id: string
          jornada_slug: string
          materials_url: string | null
          processed: boolean | null
          processed_at: string | null
          session_day: number
          session_id: string | null
          session_title: string
          youtube_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jornada_slug: string
          materials_url?: string | null
          processed?: boolean | null
          processed_at?: string | null
          session_day: number
          session_id?: string | null
          session_title: string
          youtube_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jornada_slug?: string
          materials_url?: string | null
          processed?: boolean | null
          processed_at?: string | null
          session_day?: number
          session_id?: string | null
          session_title?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jornada_notification_queue_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "jornada_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      jornada_reminders: {
        Row: {
          created_at: string | null
          email: string
          id: string
          jornada_access_id: string | null
          sent_at: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          jornada_access_id?: string | null
          sent_at?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          jornada_access_id?: string | null
          sent_at?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jornada_reminders_jornada_access_id_fkey"
            columns: ["jornada_access_id"]
            isOneToOne: false
            referencedRelation: "jornada_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornada_reminders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "jornada_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      jornada_sessions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_unlocked: boolean | null
          jornada_slug: string
          materials_url: string | null
          order_index: number
          session_day: number
          session_month: string
          title: string
          unlock_date: string | null
          updated_at: string | null
          youtube_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_unlocked?: boolean | null
          jornada_slug?: string
          materials_url?: string | null
          order_index?: number
          session_day: number
          session_month?: string
          title: string
          unlock_date?: string | null
          updated_at?: string | null
          youtube_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_unlocked?: boolean | null
          jornada_slug?: string
          materials_url?: string | null
          order_index?: number
          session_day?: number
          session_month?: string
          title?: string
          unlock_date?: string | null
          updated_at?: string | null
          youtube_id?: string | null
        }
        Relationships: []
      }
      lead_action_notes: {
        Row: {
          action_type: string | null
          admin_user_id: string
          content: string
          created_at: string
          id: string
          lead_id: string
        }
        Insert: {
          action_type?: string | null
          admin_user_id: string
          content: string
          created_at?: string
          id?: string
          lead_id: string
        }
        Update: {
          action_type?: string | null
          admin_user_id?: string
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_action_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_conversions: {
        Row: {
          converted_at: string
          converted_by: string | null
          course_id: string | null
          created_at: string
          id: string
          lead_id: string
          notes: string | null
          product_name: string | null
          revenue: number | null
        }
        Insert: {
          converted_at?: string
          converted_by?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          notes?: string | null
          product_name?: string | null
          revenue?: number | null
        }
        Update: {
          converted_at?: string
          converted_by?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          notes?: string | null
          product_name?: string | null
          revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_conversions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_conversions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_engagement_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          lead_id: string
          points: number
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          lead_id: string
          points?: number
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          lead_id?: string
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_engagement_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_name: string
          event_type: string
          id: string
          lead_id: string | null
          page_title: string | null
          page_url: string | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_name: string
          event_type: string
          id?: string
          lead_id?: string | null
          page_title?: string | null
          page_url?: string | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_name?: string
          event_type?: string
          id?: string
          lead_id?: string | null
          page_title?: string | null
          page_url?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_interactions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          interaction_type: string
          lead_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          interaction_type: string
          lead_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          interaction_type?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tracking_tokens: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          lead_id: string | null
          target_url: string | null
          token: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          target_url?: string | null
          token: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          target_url?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tracking_tokens_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          behavior_score: number | null
          created_at: string
          discard_notes: string | null
          discard_reason: string | null
          email: string
          full_name: string
          id: string
          investment_range: string | null
          last_contact_at: string | null
          meeting_link: string | null
          meeting_notes: string | null
          meeting_scheduled_at: string | null
          meeting_status: string | null
          mentoring_goals: string | null
          messages_sent: number | null
          notes: string | null
          nurturing_active: boolean | null
          nurturing_step: number | null
          pain_points: string[] | null
          phone: string | null
          practice_area: string | null
          product_interest: string | null
          score: number | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          student_user_id: string | null
          temperature: Database["public"]["Enums"]["lead_temperature"] | null
          updated_at: string
        }
        Insert: {
          behavior_score?: number | null
          created_at?: string
          discard_notes?: string | null
          discard_reason?: string | null
          email: string
          full_name: string
          id?: string
          investment_range?: string | null
          last_contact_at?: string | null
          meeting_link?: string | null
          meeting_notes?: string | null
          meeting_scheduled_at?: string | null
          meeting_status?: string | null
          mentoring_goals?: string | null
          messages_sent?: number | null
          notes?: string | null
          nurturing_active?: boolean | null
          nurturing_step?: number | null
          pain_points?: string[] | null
          phone?: string | null
          practice_area?: string | null
          product_interest?: string | null
          score?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          student_user_id?: string | null
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
          updated_at?: string
        }
        Update: {
          behavior_score?: number | null
          created_at?: string
          discard_notes?: string | null
          discard_reason?: string | null
          email?: string
          full_name?: string
          id?: string
          investment_range?: string | null
          last_contact_at?: string | null
          meeting_link?: string | null
          meeting_notes?: string | null
          meeting_scheduled_at?: string | null
          meeting_status?: string | null
          mentoring_goals?: string | null
          messages_sent?: number | null
          notes?: string | null
          nurturing_active?: boolean | null
          nurturing_step?: number | null
          pain_points?: string[] | null
          phone?: string | null
          practice_area?: string | null
          product_interest?: string | null
          score?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          student_user_id?: string | null
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_path_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_required: boolean | null
          learning_path_id: string
          order_index: number | null
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_required?: boolean | null
          learning_path_id: string
          order_index?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_required?: boolean | null
          learning_path_id?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_courses_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: string | null
          estimated_hours: number | null
          id: string
          is_published: boolean | null
          order_index: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_chapters: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          order_index: number | null
          timestamp_seconds: number
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          order_index?: number | null
          timestamp_seconds: number
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          order_index?: number | null
          timestamp_seconds?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_chapters_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_materials: {
        Row: {
          created_at: string
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
          title: string
        }
        Insert: {
          created_at?: string
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
          title: string
        }
        Update: {
          created_at?: string
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_id: string
          timestamp_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lesson_id: string
          timestamp_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_id?: string
          timestamp_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_quizzes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_required: boolean | null
          lesson_id: string
          passing_score: number
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          lesson_id: string
          passing_score?: number
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          lesson_id?: string
          passing_score?: number
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_transcripts: {
        Row: {
          generated_at: string | null
          id: string
          language: string | null
          lesson_id: string | null
          status: string | null
          transcript: string | null
          word_count: number | null
        }
        Insert: {
          generated_at?: string | null
          id?: string
          language?: string | null
          lesson_id?: string | null
          status?: string | null
          transcript?: string | null
          word_count?: number | null
        }
        Update: {
          generated_at?: string | null
          id?: string
          language?: string | null
          lesson_id?: string | null
          status?: string | null
          transcript?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_transcripts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          action_button_text: string | null
          action_type: Database["public"]["Enums"]["action_type"] | null
          action_url: string | null
          created_at: string
          custom_thumbnail_url: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          duration_minutes: number | null
          form_type: string | null
          id: string
          is_free: boolean | null
          lesson_label: string | null
          lesson_type: Database["public"]["Enums"]["lesson_type"] | null
          module_id: string
          order_index: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          action_button_text?: string | null
          action_type?: Database["public"]["Enums"]["action_type"] | null
          action_url?: string | null
          created_at?: string
          custom_thumbnail_url?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          form_type?: string | null
          id?: string
          is_free?: boolean | null
          lesson_label?: string | null
          lesson_type?: Database["public"]["Enums"]["lesson_type"] | null
          module_id: string
          order_index?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          action_button_text?: string | null
          action_type?: Database["public"]["Enums"]["action_type"] | null
          action_url?: string | null
          created_at?: string
          custom_thumbnail_url?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          form_type?: string | null
          id?: string
          is_free?: boolean | null
          lesson_label?: string | null
          lesson_type?: Database["public"]["Enums"]["lesson_type"] | null
          module_id?: string
          order_index?: number | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      level_rewards: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          level: number
          reward_description: string
          reward_type: string
          reward_value: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          level: number
          reward_description: string
          reward_type: string
          reward_value: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          level?: number
          reward_description?: string
          reward_type?: string
          reward_value?: string
        }
        Relationships: []
      }
      mentoring_sessions: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          meeting_url: string | null
          mentor_id: string | null
          notes: string | null
          scheduled_at: string
          session_type: string | null
          status: string | null
          student_feedback: string | null
          student_id: string
          student_rating: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          mentor_id?: string | null
          notes?: string | null
          scheduled_at: string
          session_type?: string | null
          status?: string | null
          student_feedback?: string | null
          student_id: string
          student_rating?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          mentor_id?: string | null
          notes?: string | null
          scheduled_at?: string
          session_type?: string | null
          status?: string | null
          student_feedback?: string | null
          student_id?: string
          student_rating?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          email_body: string | null
          email_subject: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          target_audience: string
          updated_at: string | null
          whatsapp_message: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          email_body?: string | null
          email_subject?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          target_audience?: string
          updated_at?: string | null
          whatsapp_message?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          email_body?: string | null
          email_subject?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          target_audience?: string
          updated_at?: string | null
          whatsapp_message?: string | null
        }
        Relationships: []
      }
      mission_comments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_approved: boolean | null
          is_delivery: boolean | null
          mission_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_delivery?: boolean | null
          mission_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_delivery?: boolean | null
          mission_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_comments_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "weekly_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_submission_history: {
        Row: {
          admin_feedback: string | null
          created_at: string | null
          id: string
          mission_id: string
          proof_content: string | null
          proof_file_url: string | null
          proof_links: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          admin_feedback?: string | null
          created_at?: string | null
          id?: string
          mission_id: string
          proof_content?: string | null
          proof_file_url?: string | null
          proof_links?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          admin_feedback?: string | null
          created_at?: string | null
          id?: string
          mission_id?: string
          proof_content?: string | null
          proof_file_url?: string | null
          proof_links?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_submission_history_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "weekly_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      module_completions: {
        Row: {
          completed_at: string
          course_id: string
          id: string
          module_id: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string
          course_id: string
          id?: string
          module_id: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          completed_at?: string
          course_id?: string
          id?: string
          module_id?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "module_completions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_dynamic: boolean | null
          module_type: Database["public"]["Enums"]["module_type"] | null
          order_index: number | null
          title: string
          unlock_date: string | null
          unlock_week: number | null
        }
        Insert: {
          course_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          module_type?: Database["public"]["Enums"]["module_type"] | null
          order_index?: number | null
          title: string
          unlock_date?: string | null
          unlock_week?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          module_type?: Database["public"]["Enums"]["module_type"] | null
          order_index?: number | null
          title?: string
          unlock_date?: string | null
          unlock_week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          message: string
          name: string
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          message: string
          name: string
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          message?: string
          name?: string
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nurturing_executions: {
        Row: {
          emails_sent: number
          error_details: string | null
          errors_count: number
          executed_at: string
          execution_time_ms: number | null
          id: string
          leads_processed: Json | null
          status: string
        }
        Insert: {
          emails_sent?: number
          error_details?: string | null
          errors_count?: number
          executed_at?: string
          execution_time_ms?: number | null
          id?: string
          leads_processed?: Json | null
          status?: string
        }
        Update: {
          emails_sent?: number
          error_details?: string | null
          errors_count?: number
          executed_at?: string
          execution_time_ms?: number | null
          id?: string
          leads_processed?: Json | null
          status?: string
        }
        Relationships: []
      }
      nurturing_sequences: {
        Row: {
          created_at: string
          delay_hours: number
          email_body: string
          email_subject: string
          id: string
          is_active: boolean
          name: string
          source_filter: string | null
          step_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delay_hours?: number
          email_body: string
          email_subject: string
          id?: string
          is_active?: boolean
          name: string
          source_filter?: string | null
          step_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delay_hours?: number
          email_body?: string
          email_subject?: string
          id?: string
          is_active?: boolean
          name?: string
          source_filter?: string | null
          step_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email_community: boolean | null
          email_new_lessons: boolean | null
          email_reminders: boolean | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email_community?: boolean | null
          email_new_lessons?: boolean | null
          email_reminders?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email_community?: boolean | null
          email_new_lessons?: boolean | null
          email_reminders?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      program_titles: {
        Row: {
          course_id: string
          created_at: string | null
          emoji: string | null
          id: string
          requirement_description: string | null
          title: string
          week_number: number
        }
        Insert: {
          course_id: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          requirement_description?: string | null
          title: string
          week_number: number
        }
        Update: {
          course_id?: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          requirement_description?: string | null
          title?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "program_titles_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          lesson_id: string
          progress_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id: string
          progress_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string
          progress_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          max_score: number
          passed: boolean | null
          quiz_id: string
          score: number
          time_spent_seconds: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          answers?: Json
          completed_at?: string
          id?: string
          max_score?: number
          passed?: boolean | null
          quiz_id: string
          score?: number
          time_spent_seconds?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          max_score?: number
          passed?: boolean | null
          quiz_id?: string
          score?: number
          time_spent_seconds?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lesson_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          options: Json
          order_index: number | null
          points: number
          question_text: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          order_index?: number | null
          points?: number
          question_text: string
          question_type?: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          order_index?: number | null
          points?: number
          question_text?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lesson_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          admin_id: string
          created_at: string
          entity_type: string
          filter_config: Json
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          entity_type: string
          filter_config?: Json
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          entity_type?: string
          filter_config?: Json
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_messages: {
        Row: {
          channel: string
          created_at: string | null
          created_by: string | null
          error_message: string | null
          failed_count: number | null
          id: string
          message: string
          processed_at: string | null
          recipient_count: number | null
          scheduled_for: string
          sent_count: number | null
          source_filter: string | null
          status: string | null
          status_filter: string | null
          subject: string | null
          temperature_filter: string | null
          template_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          failed_count?: number | null
          id?: string
          message: string
          processed_at?: string | null
          recipient_count?: number | null
          scheduled_for: string
          sent_count?: number | null
          source_filter?: string | null
          status?: string | null
          status_filter?: string | null
          subject?: string | null
          temperature_filter?: string | null
          template_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          failed_count?: number | null
          id?: string
          message?: string
          processed_at?: string | null
          recipient_count?: number | null
          scheduled_for?: string
          sent_count?: number | null
          source_filter?: string | null
          status?: string | null
          status_filter?: string | null
          subject?: string | null
          temperature_filter?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      student_avatar_forms: {
        Row: {
          avatar_idade: string | null
          avatar_momento_vida: string | null
          avatar_orientacao_politica: string | null
          avatar_profissao: string | null
          avatar_religiao: string | null
          avatar_salario: string | null
          avatar_sexo: string | null
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          desejos_financeiros: string[] | null
          desejos_pessoais: string[] | null
          desejos_profissionais: string[] | null
          dores_emocionais: string[] | null
          dores_pessoais: string[] | null
          dores_profissionais: string[] | null
          dores_relacionamento: string[] | null
          id: string
          is_completed: boolean | null
          lesson_id: string | null
          nicho: string | null
          resumo_avatar: string | null
          roma: string | null
          subnicho: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_idade?: string | null
          avatar_momento_vida?: string | null
          avatar_orientacao_politica?: string | null
          avatar_profissao?: string | null
          avatar_religiao?: string | null
          avatar_salario?: string | null
          avatar_sexo?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          desejos_financeiros?: string[] | null
          desejos_pessoais?: string[] | null
          desejos_profissionais?: string[] | null
          dores_emocionais?: string[] | null
          dores_pessoais?: string[] | null
          dores_profissionais?: string[] | null
          dores_relacionamento?: string[] | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string | null
          nicho?: string | null
          resumo_avatar?: string | null
          roma?: string | null
          subnicho?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_idade?: string | null
          avatar_momento_vida?: string | null
          avatar_orientacao_politica?: string | null
          avatar_profissao?: string | null
          avatar_religiao?: string | null
          avatar_salario?: string | null
          avatar_sexo?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          desejos_financeiros?: string[] | null
          desejos_pessoais?: string[] | null
          desejos_profissionais?: string[] | null
          dores_emocionais?: string[] | null
          dores_pessoais?: string[] | null
          dores_profissionais?: string[] | null
          dores_relacionamento?: string[] | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string | null
          nicho?: string | null
          resumo_avatar?: string | null
          roma?: string | null
          subnicho?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_avatar_forms_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_diagnostics: {
        Row: {
          completed: boolean | null
          created_at: string | null
          current_step: number | null
          digital_presence: string | null
          filled_from_course_id: string | null
          has_office: boolean | null
          id: string
          main_challenges: string[] | null
          main_goals: string[] | null
          marketing_knowledge: string | null
          monthly_revenue: string | null
          office_size: string | null
          practice_area: string | null
          practice_area_other: string | null
          referral_source: string | null
          revenue_goal: string | null
          updated_at: string | null
          user_id: string
          weekly_study_hours: string | null
          years_practicing: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          current_step?: number | null
          digital_presence?: string | null
          filled_from_course_id?: string | null
          has_office?: boolean | null
          id?: string
          main_challenges?: string[] | null
          main_goals?: string[] | null
          marketing_knowledge?: string | null
          monthly_revenue?: string | null
          office_size?: string | null
          practice_area?: string | null
          practice_area_other?: string | null
          referral_source?: string | null
          revenue_goal?: string | null
          updated_at?: string | null
          user_id: string
          weekly_study_hours?: string | null
          years_practicing?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          current_step?: number | null
          digital_presence?: string | null
          filled_from_course_id?: string | null
          has_office?: boolean | null
          id?: string
          main_challenges?: string[] | null
          main_goals?: string[] | null
          marketing_knowledge?: string | null
          monthly_revenue?: string | null
          office_size?: string | null
          practice_area?: string | null
          practice_area_other?: string | null
          referral_source?: string | null
          revenue_goal?: string | null
          updated_at?: string | null
          user_id?: string
          weekly_study_hours?: string | null
          years_practicing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_diagnostics_filled_from_course_id_fkey"
            columns: ["filled_from_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      study_reminders: {
        Row: {
          course_ids: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          reminder_days: string[]
          reminder_time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_ids?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          reminder_days?: string[]
          reminder_time?: string
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_ids?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          reminder_days?: string[]
          reminder_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          completion_date: string
          id: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          completion_date?: string
          id?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          completion_date?: string
          id?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          created_at: string
          id: string
          last_activity_date: string | null
          level: number
          streak_days: number
          total_lessons_completed: number
          total_study_minutes: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          total_lessons_completed?: number
          total_study_minutes?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          total_lessons_completed?: number
          total_study_minutes?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_learning_paths: {
        Row: {
          completed_at: string | null
          id: string
          learning_path_id: string
          progress_percentage: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          learning_path_id: string
          progress_percentage?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          learning_path_id?: string
          progress_percentage?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_paths_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mission_completions: {
        Row: {
          admin_feedback: string | null
          created_at: string | null
          id: string
          mission_id: string
          proof_content: string | null
          proof_file_url: string | null
          proof_links: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["mission_status"] | null
          submitted_at: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          admin_feedback?: string | null
          created_at?: string | null
          id?: string
          mission_id: string
          proof_content?: string | null
          proof_file_url?: string | null
          proof_links?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          submitted_at?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          admin_feedback?: string | null
          created_at?: string | null
          id?: string
          mission_id?: string
          proof_content?: string | null
          proof_file_url?: string | null
          proof_links?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          submitted_at?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_completions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "weekly_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          claimed_at: string
          id: string
          is_claimed: boolean | null
          reward_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          is_claimed?: boolean | null
          reward_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          is_claimed?: boolean | null
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "level_rewards"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      video_analytics: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          drop_off_point: number | null
          id: string
          lesson_id: string | null
          pause_events: number | null
          play_events: number | null
          seek_events: number | null
          session_id: string | null
          total_duration_seconds: number | null
          updated_at: string | null
          user_id: string
          watched_seconds: number | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          drop_off_point?: number | null
          id?: string
          lesson_id?: string | null
          pause_events?: number | null
          play_events?: number | null
          seek_events?: number | null
          session_id?: string | null
          total_duration_seconds?: number | null
          updated_at?: string | null
          user_id: string
          watched_seconds?: number | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          drop_off_point?: number | null
          id?: string
          lesson_id?: string | null
          pause_events?: number | null
          play_events?: number | null
          seek_events?: number | null
          session_id?: string | null
          total_duration_seconds?: number | null
          updated_at?: string | null
          user_id?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_analytics_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      video_library: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_type: string | null
          video_url: string
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_type?: string | null
          video_url: string
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_type?: string | null
          video_url?: string
          views_count?: number | null
        }
        Relationships: []
      }
      weekly_missions: {
        Row: {
          badge_unlock_id: string | null
          challenge_description: string
          course_id: string
          created_at: string | null
          gamification_emoji: string | null
          gamification_reward: string | null
          gamification_title: string | null
          id: string
          is_active: boolean | null
          month_number: number | null
          month_title: string | null
          proof_type: string | null
          related_lesson_id: string | null
          requires_proof: boolean | null
          title: string
          updated_at: string | null
          week_number: number
          why_do: string | null
          xp_reward: number | null
        }
        Insert: {
          badge_unlock_id?: string | null
          challenge_description: string
          course_id: string
          created_at?: string | null
          gamification_emoji?: string | null
          gamification_reward?: string | null
          gamification_title?: string | null
          id?: string
          is_active?: boolean | null
          month_number?: number | null
          month_title?: string | null
          proof_type?: string | null
          related_lesson_id?: string | null
          requires_proof?: boolean | null
          title: string
          updated_at?: string | null
          week_number: number
          why_do?: string | null
          xp_reward?: number | null
        }
        Update: {
          badge_unlock_id?: string | null
          challenge_description?: string
          course_id?: string
          created_at?: string | null
          gamification_emoji?: string | null
          gamification_reward?: string | null
          gamification_title?: string | null
          id?: string
          is_active?: boolean | null
          month_number?: number | null
          month_title?: string | null
          proof_type?: string | null
          related_lesson_id?: string | null
          requires_proof?: boolean | null
          title?: string
          updated_at?: string | null
          week_number?: number
          why_do?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_missions_badge_unlock_id_fkey"
            columns: ["badge_unlock_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_missions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_missions_related_lesson_id_fkey"
            columns: ["related_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          contact_id: string | null
          contact_name: string | null
          contact_type: string
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          phone: string
          status: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          contact_id?: string | null
          contact_name?: string | null
          contact_type?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          phone: string
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          contact_id?: string | null
          contact_name?: string | null
          contact_type?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          phone?: string
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          conversation_id: string
          created_at: string
          direction: string
          error_message: string | null
          evolution_id: string | null
          id: string
          media_filename: string | null
          media_mimetype: string | null
          media_size: number | null
          media_type: string | null
          media_url: string | null
          message: string
          message_type: string
          phone: string
          sent_by: string | null
          status: string
          template_id: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          direction: string
          error_message?: string | null
          evolution_id?: string | null
          id?: string
          media_filename?: string | null
          media_mimetype?: string | null
          media_size?: number | null
          media_type?: string | null
          media_url?: string | null
          message: string
          message_type?: string
          phone: string
          sent_by?: string | null
          status?: string
          template_id?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          direction?: string
          error_message?: string | null
          evolution_id?: string | null
          id?: string
          media_filename?: string | null
          media_mimetype?: string | null
          media_size?: number | null
          media_type?: string | null
          media_url?: string | null
          message?: string
          message_type?: string
          phone?: string
          sent_by?: string | null
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_typing_status: {
        Row: {
          conversation_id: string | null
          id: string
          is_typing: boolean | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          is_typing?: boolean | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          is_typing?: boolean | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_typing_status_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_lead_score: { Args: { p_lead_id: string }; Returns: number }
      create_admin_notification: {
        Args: {
          p_event_type: string
          p_message: string
          p_metadata?: Json
          p_title: string
        }
        Returns: undefined
      }
      enroll_existing_students_in_free_courses: {
        Args: never
        Returns: undefined
      }
      generate_certificate: {
        Args: {
          p_course_id: string
          p_course_title: string
          p_student_name: string
          p_user_id: string
        }
        Returns: string
      }
      get_current_program_week: {
        Args: { p_enrollment_date: string }
        Returns: number
      }
      get_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          full_name: string
          level: number
          rank: number
          streak_days: number
          user_id: string
          xp: number
        }[]
      }
      get_program_detail_data: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: Json
      }
      get_program_leaderboard: {
        Args: { limit_count?: number; p_course_id: string }
        Returns: {
          avatar_url: string
          current_title: string
          full_name: string
          level: number
          missions_completed: number
          rank: number
          user_id: string
          xp: number
        }[]
      }
      get_student_dashboard_data: { Args: { p_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_module_unlocked: {
        Args: { p_module_id: string; p_user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      notify_weekly_content: { Args: never; Returns: undefined }
      notify_weekly_missions: { Args: never; Returns: undefined }
      upsert_lead_and_return_id: {
        Args: {
          p_email: string
          p_full_name: string
          p_phone?: string
          p_source?: string
        }
        Returns: string
      }
    }
    Enums: {
      action_type: "calendar" | "whatsapp" | "form" | "external" | "diagnostic"
      app_role: "admin" | "student"
      lead_status:
        | "new"
        | "contacted"
        | "negotiating"
        | "converted"
        | "lost"
        | "qualified"
        | "meeting"
        | "discarded"
      lead_temperature: "cold" | "warm" | "hot"
      lesson_type:
        | "video"
        | "action"
        | "scheduling"
        | "upload"
        | "text"
        | "diagnostic"
      mission_status: "pending" | "submitted" | "approved" | "rejected"
      module_type:
        | "onboarding"
        | "dynamic"
        | "pillar"
        | "recordings"
        | "individual"
      program_type:
        | "workshop-ia"
        | "experience-start"
        | "aceleracao"
        | "mentoria-360"
        | "elite"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
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
      action_type: ["calendar", "whatsapp", "form", "external", "diagnostic"],
      app_role: ["admin", "student"],
      lead_status: [
        "new",
        "contacted",
        "negotiating",
        "converted",
        "lost",
        "qualified",
        "meeting",
        "discarded",
      ],
      lead_temperature: ["cold", "warm", "hot"],
      lesson_type: [
        "video",
        "action",
        "scheduling",
        "upload",
        "text",
        "diagnostic",
      ],
      mission_status: ["pending", "submitted", "approved", "rejected"],
      module_type: [
        "onboarding",
        "dynamic",
        "pillar",
        "recordings",
        "individual",
      ],
      program_type: [
        "workshop-ia",
        "experience-start",
        "aceleracao",
        "mentoria-360",
        "elite",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const
