export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  isLiked?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  name?: string;
  imageUrl?: string;
}
