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
      dispatches: {
        Row: {
          created_at: string
          dispatch_number: string
          dropoff_location: string
          fee: number
          id: string
          package_description: string | null
          pickup_location: string
          rider_id: string | null
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          dispatch_number: string
          dropoff_location: string
          fee?: number
          id?: string
          package_description?: string | null
          pickup_location: string
          rider_id?: string | null
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          dispatch_number?: string
          dropoff_location?: string
          fee?: number
          id?: string
          package_description?: string | null
          pickup_location?: string
          rider_id?: string | null
          status?: string
          student_id?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          available: boolean
          created_at: string
          description: string | null
          id: string
          image: string
          name: string
          price: number
          restaurant_id: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image?: string
          name: string
          price: number
          restaurant_id: string
        }
        Update: {
          available?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image?: string
          name?: string
          price?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          menu_item_id: string
          name: string
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          id?: string
          menu_item_id: string
          name: string
          order_id: string
          price: number
          quantity?: number
        }
        Update: {
          id?: string
          menu_item_id?: string
          name?: string
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_fee: number
          id: string
          order_number: string
          payment_method: string
          restaurant_id: string
          rider_id: string | null
          status: string
          student_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number
          id?: string
          order_number: string
          payment_method?: string
          restaurant_id: string
          rider_id?: string | null
          status?: string
          student_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number
          id?: string
          order_number?: string
          payment_method?: string
          restaurant_id?: string
          rider_id?: string | null
          status?: string
          student_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          created_at: string
          cuisine: string
          delivery_time: string
          id: string
          image: string
          is_open: boolean
          name: string
          owner_id: string
          price_range: string | null
          rating: number
          tag: string | null
        }
        Insert: {
          created_at?: string
          cuisine?: string
          delivery_time?: string
          id?: string
          image?: string
          is_open?: boolean
          name: string
          owner_id: string
          price_range?: string | null
          rating?: number
          tag?: string | null
        }
        Update: {
          created_at?: string
          cuisine?: string
          delivery_time?: string
          id?: string
          image?: string
          is_open?: boolean
          name?: string
          owner_id?: string
          price_range?: string | null
          rating?: number
          tag?: string | null
        }
        Relationships: []
      }
      trip_bookings: {
        Row: {
          boarding_code: string
          created_at: string
          id: string
          route_id: string
          status: string
          student_id: string
        }
        Insert: {
          boarding_code: string
          created_at?: string
          id?: string
          route_id: string
          status?: string
          student_id: string
        }
        Update: {
          boarding_code?: string
          created_at?: string
          id?: string
          route_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_bookings_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "trip_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_routes: {
        Row: {
          active: boolean
          from_location: string
          id: string
          next_departure: string | null
          price: number
          seats_available: number
          to_location: string
        }
        Insert: {
          active?: boolean
          from_location: string
          id?: string
          next_departure?: string | null
          price: number
          seats_available?: number
          to_location: string
        }
        Update: {
          active?: boolean
          from_location?: string
          id?: string
          next_departure?: string | null
          price?: number
          seats_available?: number
          to_location?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          icon: string
          id: string
          label: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          icon?: string
          id?: string
          label?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          icon?: string
          id?: string
          label?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "vendor" | "rider" | "admin"
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
      app_role: ["student", "vendor", "rider", "admin"],
    },
  },
} as const
