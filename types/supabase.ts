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
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          image_url: string | null;
          status: ProductStatus;
          additional_info: string | null;
          detail_image_urls: string[];
          measurements: string | null;
          categories: string[] | null;
          rating_average: number | null;
          review_summary: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          sale_price?: number | null;
          image_url?: string | null;
          status?: ProductStatus;
          additional_info?: string | null;
          detail_image_urls?: string[];
          measurements?: string | null;
          categories?: string[] | null;
          rating_average?: number | null;
          review_summary?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          image_url?: string | null;
          status?: ProductStatus;
          additional_info?: string | null;
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
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
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
          quantity?: number;
          unit_price?: number;
          unit_sale_price?: number | null;
          product_name?: string | null;
          product_image_url?: string | null;
          line_subtotal?: number;
        };
        Relationships: [];
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
          user_id: string;
          product_id: string;
          rating: number;
          content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          rating: number;
          content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          rating?: number;
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
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
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
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
