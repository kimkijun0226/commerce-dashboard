export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          image_url: string | null;
          status: "registered" | "hidden" | "sold_out";
          created_at: string | null;
          updated_at: string | null;
          additional_info: string | null;
          measurements: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          sale_price?: number | null;
          image_url?: string | null;
          status?: "registered" | "hidden" | "sold_out";
          created_at?: string | null;
          updated_at?: string | null;
          additional_info?: string | null;
          measurements?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          image_url?: string | null;
          status?: "registered" | "hidden" | "sold_out";
          created_at?: string | null;
          updated_at?: string | null;
          additional_info?: string | null;
          measurements?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
