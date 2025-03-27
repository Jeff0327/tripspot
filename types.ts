export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      review: {
        Row: {
          content: string
          created_at: string
          id: string
          images: string[] | null
          rating: number
          store_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          images?: string[] | null
          rating?: number
          store_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          images?: string[] | null
          rating?: number
          store_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store"
            referencedColumns: ["id"]
          },
        ]
      }
      store: {
        Row: {
          address: string
          addressVerified: boolean
          created_at: string
          desc: string | null
          detail: string | null
          id: string
          images: string | null
          like: number | null
          mainimage: string | null
          name: string
          options: Json | null
          review_ids: string[] | null
          star: number | null
          tag: string | null
          user_id: string
        }
        Insert: {
          address: string
          addressVerified?: boolean
          created_at?: string
          desc?: string | null
          detail?: string | null
          id?: string
          images?: string | null
          like?: number | null
          mainimage?: string | null
          name: string
          options?: Json | null
          review_ids?: string[] | null
          star?: number | null
          tag?: string | null
          user_id: string
        }
        Update: {
          address?: string
          addressVerified?: boolean
          created_at?: string
          desc?: string | null
          detail?: string | null
          id?: string
          images?: string | null
          like?: number | null
          mainimage?: string | null
          name?: string
          options?: Json | null
          review_ids?: string[] | null
          star?: number | null
          tag?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_store_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          image_url: string | null
          likes: string[] | null
          loginType: string | null
          nickname: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          image_url?: string | null
          likes?: string[] | null
          loginType?: string | null
          nickname: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          image_url?: string | null
          likes?: string[] | null
          loginType?: string | null
          nickname?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_store_like: {
        Args: {
          store_id: string
        }
        Returns: undefined
      }
      increment_store_like: {
        Args: {
          store_id: string
        }
        Returns: undefined
      }
      random_store_food: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          addressVerified: boolean
          created_at: string
          desc: string | null
          detail: string | null
          id: string
          images: string | null
          like: number | null
          mainimage: string | null
          name: string
          options: Json | null
          review_ids: string[] | null
          star: number | null
          tag: string | null
          user_id: string
        }[]
      }
      random_store_hotel: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          addressVerified: boolean
          created_at: string
          desc: string | null
          detail: string | null
          id: string
          images: string | null
          like: number | null
          mainimage: string | null
          name: string
          options: Json | null
          review_ids: string[] | null
          star: number | null
          tag: string | null
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
