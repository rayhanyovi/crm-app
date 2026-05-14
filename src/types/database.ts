export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
          role: "ADMIN" | "MANAGER" | "SALES" | "VIEWER";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string | null;
          role?: "ADMIN" | "MANAGER" | "SALES" | "VIEWER";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          industry: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          created_by_id: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_by_id: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          title: string | null;
          company_id: string | null;
          source: Database["public"]["Enums"]["lead_source"] | null;
          created_by_id: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          title?: string | null;
          company_id?: string | null;
          source?: Database["public"]["Enums"]["lead_source"] | null;
          created_by_id: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          source: Database["public"]["Enums"]["lead_source"];
          status: Database["public"]["Enums"]["lead_status"];
          company_id: string | null;
          assigned_to_id: string | null;
          converted_contact_id: string | null;
          converted_at: string | null;
          notes: string | null;
          created_by_id: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          source: Database["public"]["Enums"]["lead_source"];
          status?: Database["public"]["Enums"]["lead_status"];
          company_id?: string | null;
          assigned_to_id?: string | null;
          converted_contact_id?: string | null;
          converted_at?: string | null;
          notes?: string | null;
          created_by_id: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          title: string;
          value: number;
          stage: Database["public"]["Enums"]["deal_stage"];
          contact_id: string;
          company_id: string | null;
          lead_id: string | null;
          assigned_to_id: string | null;
          expected_close_date: string | null;
          lost_reason: string | null;
          closed_at: string | null;
          created_by_id: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          value?: number;
          stage?: Database["public"]["Enums"]["deal_stage"];
          contact_id: string;
          company_id?: string | null;
          lead_id?: string | null;
          assigned_to_id?: string | null;
          expected_close_date?: string | null;
          lost_reason?: string | null;
          closed_at?: string | null;
          created_by_id: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["deals"]["Insert"]>;
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          type: Database["public"]["Enums"]["activity_type"];
          subject: string;
          description: string | null;
          result: Database["public"]["Enums"]["activity_result"] | null;
          scheduled_at: string | null;
          completed_at: string | null;
          metadata: Json | null;
          deal_id: string | null;
          contact_id: string | null;
          lead_id: string | null;
          assigned_to_id: string | null;
          created_by_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: Database["public"]["Enums"]["activity_type"];
          subject: string;
          description?: string | null;
          result?: Database["public"]["Enums"]["activity_result"] | null;
          scheduled_at?: string | null;
          completed_at?: string | null;
          metadata?: Json | null;
          deal_id?: string | null;
          contact_id?: string | null;
          lead_id?: string | null;
          assigned_to_id?: string | null;
          created_by_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: Database["public"]["Enums"]["audit_action"];
          entity_type: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: Database["public"]["Enums"]["audit_action"];
          entity_type: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "ADMIN" | "MANAGER" | "SALES" | "VIEWER";
      lead_status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
      lead_source:
        | "WEBSITE"
        | "REFERRAL"
        | "COLD_CALL"
        | "SOCIAL_MEDIA"
        | "EVENT"
        | "ADVERTISEMENT"
        | "OTHER";
      deal_stage:
        | "LEAD"
        | "QUALIFIED"
        | "PROPOSAL"
        | "NEGOTIATION"
        | "CLOSED_WON"
        | "CLOSED_LOST";
      activity_type:
        | "CALL"
        | "EMAIL"
        | "MEETING"
        | "TASK"
        | "NOTE"
        | "DEMO"
        | "FOLLOW_UP";
      activity_result:
        | "COMPLETED"
        | "NO_ANSWER"
        | "FOLLOW_UP_NEEDED"
        | "MEETING_SCHEDULED"
        | "DEAL_ADVANCED"
        | "CANCELLED"
        | "FAILED";
      notification_type:
        | "LEAD_ASSIGNED"
        | "LEAD_CONVERTED"
        | "DEAL_STAGE_CHANGED"
        | "DEAL_ASSIGNED"
        | "DEAL_CLOSED"
        | "DEAL_STALE"
        | "COMMENT_ADDED";
      audit_action:
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "STAGE_CHANGE"
        | "ASSIGNMENT_CHANGE"
        | "STATUS_CHANGE"
        | "CONVERSION"
        | "ARCHIVE";
      entity_type: "COMPANY" | "CONTACT" | "LEAD" | "DEAL" | "ACTIVITY" | "USER";
    };
    CompositeTypes: Record<string, never>;
  };
};
