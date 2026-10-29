export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin";

export type ProductStatus = "registered" | "hidden" | "sold_out";
export type OrderStatus = "pending" | "paid" | "canceled" | "refunded";
export type PaymentStatusOrder =
  | "requested"
  | "success"
  | "failed"
  | "refund_requested"
  | "refund_completed";
export type PaymentStatusPayment =
  | "pending"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          image_url: string | null;
          phone: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          image_url?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          image_url?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          recipient_name: string | null;
          recipient_phone: string | null;
          address_line1: string;
          address_line2: string | null;
          memo: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          address_line1: string;
          address_line2?: string | null;
          memo?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          address_line1?: string;
          address_line2?: string | null;
          memo?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      store_settings: {
        Row: { department: string; logo_url: string | null; banners: Json; updated_at: string };
        Insert: { department: string; logo_url?: string | null; banners?: Json; updated_at?: string };
        Update: { logo_url?: string | null; banners?: Json; updated_at?: string };
        Relationships: [];
      };
      products: {
        Row: {
          department: "fashion" | "beauty" | "home";
          id: string;
          name: string;
          search_keywords: string[];
          search_text: string;
          options: Json;
          description: string | null;
          price: number;
          sale_price: number | null;
          image_url: string | null;
          status: ProductStatus;
          additional_info: Json;
          detail_image_urls: string[];
          measurements: string | null;
          categories: string[] | null;
          rating_average: number | null;
          review_summary: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          department?: "fashion" | "beauty" | "home";
          id?: string;
          name: string;
          search_keywords?: string[];
          options?: Json;
          description?: string | null;
          price: number;
          sale_price?: number | null;
          image_url?: string | null;
          status?: ProductStatus;
          additional_info?: Json;
          detail_image_urls?: string[];
          measurements?: string | null;
          categories?: string[] | null;
          rating_average?: number | null;
          review_summary?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          department?: "fashion" | "beauty" | "home";
          id?: string;
          name?: string;
          search_keywords?: string[];
          options?: Json;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          image_url?: string | null;
          status?: ProductStatus;
          additional_info?: Json;
          detail_image_urls?: string[];
          measurements?: string | null;
          categories?: string[] | null;
          rating_average?: number | null;
          review_summary?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          fulfillment_status: string;
          shipping_carrier: string | null;
          tracking_number: string | null;
          shipped_at: string | null;
          id: string;
          user_id: string;
          status: OrderStatus;
          total_amount: number;
          subtotal_amount: number;
          shipping_fee: number;
          discount_amount: number;
          currency: string;
          payment_status: PaymentStatusOrder;
          contact_name: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          shipping_name: string | null;
          shipping_phone: string | null;
          shipping_address_line1: string | null;
          shipping_address_line2: string | null;
          shipping_city: string | null;
          shipping_state: string | null;
          shipping_zip: string | null;
          shipping_country: string | null;
          toss_order_id: string | null;
          created_at: string;
          updated_at: string;
          paid_at: string | null;
        };
        Insert: {
          fulfillment_status?: string;
          shipping_carrier?: string | null;
          tracking_number?: string | null;
          shipped_at?: string | null;
          id?: string;
          user_id: string;
          status?: OrderStatus;
          total_amount?: number;
          subtotal_amount?: number;
          shipping_fee?: number;
          discount_amount?: number;
          currency?: string;
          payment_status?: PaymentStatusOrder;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          shipping_name?: string | null;
          shipping_phone?: string | null;
          shipping_address_line1?: string | null;
          shipping_address_line2?: string | null;
          shipping_city?: string | null;
          shipping_state?: string | null;
          shipping_zip?: string | null;
          shipping_country?: string | null;
          toss_order_id?: string | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
        };
        Update: {
          fulfillment_status?: string;
          shipping_carrier?: string | null;
          tracking_number?: string | null;
          shipped_at?: string | null;
          id?: string;
          user_id?: string;
          status?: OrderStatus;
          total_amount?: number;
          subtotal_amount?: number;
          shipping_fee?: number;
          discount_amount?: number;
          currency?: string;
          payment_status?: PaymentStatusOrder;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          shipping_name?: string | null;
          shipping_phone?: string | null;
          shipping_address_line1?: string | null;
          shipping_address_line2?: string | null;
          shipping_city?: string | null;
          shipping_state?: string | null;
          shipping_zip?: string | null;
          shipping_country?: string | null;
          toss_order_id?: string | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          selected_options: Json;
          quantity: number;
          unit_price: number;
          unit_sale_price: number | null;
          product_name: string | null;
          product_image_url: string | null;
          line_subtotal: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          selected_options?: Json;
          quantity?: number;
          unit_price: number;
          unit_sale_price?: number | null;
          product_name?: string | null;
          product_image_url?: string | null;
          line_subtotal?: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          selected_options?: Json;
          quantity?: number;
          unit_price?: number;
          unit_sale_price?: number | null;
          product_name?: string | null;
          product_image_url?: string | null;
          line_subtotal?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          provider: string;
          method: string;
          amount: number;
          currency: string;
          status: PaymentStatusPayment;
          transaction_id: string | null;
          payment_key: string | null;
          raw_payload: Json | null;
          created_at: string;
          approved_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          provider?: string;
          method?: string;
          amount: number;
          currency?: string;
          status?: PaymentStatusPayment;
          transaction_id?: string | null;
          payment_key?: string | null;
          raw_payload?: Json | null;
          created_at?: string;
          approved_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          provider?: string;
          method?: string;
          amount?: number;
          currency?: string;
          status?: PaymentStatusPayment;
          transaction_id?: string | null;
          payment_key?: string | null;
          raw_payload?: Json | null;
          created_at?: string;
          approved_at?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          user_id: string | null;
          product_id: string;
          order_id: string | null;
          rating: number;
          is_generated: boolean;
          source_url: string | null;
          author_name: string | null;
          content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string | null;
          product_id: string;
          order_id: string | null;
          rating: number;
          is_generated?: boolean;
          source_url?: string | null;
          author_name?: string | null;
          content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          product_id?: string;
          order_id?: string | null;
          rating?: number;
          is_generated?: boolean;
          source_url?: string | null;
          author_name?: string | null;
          content?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          selected_options: Json;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          selected_options?: Json;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          selected_options?: Json;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      like_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      mcp_settings: {
        Row: {
          id: string;
          slack_enabled: boolean;
          notion_enabled: boolean;
          notion_url: string | null;
          notion_report_per_payment: boolean;
          notion_report_monthly_manual: boolean;
          notion_report_monthly_auto: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slack_enabled?: boolean;
          notion_enabled?: boolean;
          notion_url?: string | null;
          notion_report_per_payment?: boolean;
          notion_report_monthly_manual?: boolean;
          notion_report_monthly_auto?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slack_enabled?: boolean;
          notion_enabled?: boolean;
          notion_url?: string | null;
          notion_report_per_payment?: boolean;
          notion_report_monthly_manual?: boolean;
          notion_report_monthly_auto?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_sales_simulation: { Args: {p_days?: number; p_department?: string; p_page?: number; p_status?: string; p_date?: string}; Returns: Json };
      get_admin_payment_preview: { Args: Record<PropertyKey, never>; Returns: Json };
      get_admin_dashboard: { Args: Record<PropertyKey, never>; Returns: Json };
      get_catalog_category_products: {
        Args: { p_category: string; p_department?: string };
        Returns: Database["public"]["Tables"]["products"]["Row"][];
      };
      get_catalog_categories: {
        Args: { p_department?: string };
        Returns: { name: string; product_count: number }[];
      };
      update_product_review_summary_for_reviewer: {
        Args: {
          p_product_id: string;
          p_review_summary: Json;
        };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
