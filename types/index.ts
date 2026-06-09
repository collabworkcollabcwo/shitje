export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  subcategory?: string;
  condition: 'i_ri' | 'si_i_ri' | 'i_perdorur' | 'per_pjese';
  location: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  createdAt: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
  isSold?: boolean;
  views: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
  color: string;
  /** Extra Albanian/English terms that should match this category in search. */
  keywords?: string[];
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  location: string;
  joinedAt: string;
  rating: number;
  reviewCount: number;
  listings: string[];
  favorites: string[];
}

export interface Review {
  id: string;
  userId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  condition?: string;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'popular';
}
