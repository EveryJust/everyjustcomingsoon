export type Role = 'admin' | 'user' | 'vendor';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  isActive: boolean;
  isDeleted: boolean; // Soft delete flag
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SizeVariant {
  size: string;
  sku: string;
  quantity: number;
  additionalPrice?: number;
}

export interface CustomField {
  name: string;
  value: string;
}

export interface ProductMoreInfo {
  manufactureInfo: string;
  importerInfo: string;
  packerInfo: string;
  netWeightValue: number;
  netWeightUnit: 'g' | 'kg' | 'ml' | 'l';
  supplierInfo: string;
  contactInfo: string;
  legalDisclaimer: string;
}

export type ProductStatus = 'active' | 'draft' | 'archived';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  
  // Relations
  categoryIds: string[];
  brandId?: string;
  
  // Pricing
  price: number;
  offerPrice?: number;
  offerPercentage?: number;
  
  // Media
  images: string[]; // Array of Cloudinary URLs or public IDs
  
  // Inventory & Variants
  sizeVariants: SizeVariant[];
  
  // Details
  highlights: CustomField[];
  additionalDetails: CustomField[];
  moreInfo: ProductMoreInfo;
  
  // Meta
  status: ProductStatus;
  isDeleted: boolean; // Soft delete flag
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number; // 1 to 5
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithRelations extends Product {
  category?: Category;
  brand?: Brand;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}
