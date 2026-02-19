export type UUID = string;

export type Category = {
  id: UUID;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  cover_image_path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export type Product = {
  id: UUID;
  category_id: UUID;
  name: string;
  description: string | null;
  price: number;
  tags: string[];
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
};

export type ProductImage = {
  id: UUID;
  product_id: UUID;
  url: string;
  path: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
};

export type Profile = {
  id: UUID;
  email: string | null;
  role: 'admin' | 'viewer';
  created_at: string;
};

export type RestaurantSettings = {
  id: number;
  name: string | null;
  tagline: string | null;
  currency: string | null;

  address: string | null;
  phone: string | null;
  hours: string | null;
  maps_url: string | null;
  instagram_url: string | null;

  about_title: string | null;
  about_text: string | null;
  about_image_url: string | null;
  about_image_path: string | null;

  created_at: string;
  updated_at: string | null;
};
