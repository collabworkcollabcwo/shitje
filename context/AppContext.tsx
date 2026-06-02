import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Listing, User, Chat, Message, SearchFilters } from '../types';
import { MOCK_LISTINGS, MOCK_CHATS, MOCK_MESSAGES, CURRENT_USER, MOCK_USERS } from '../data/mock';
import { generateId } from '../utils/format';
import { CATEGORIES } from '../constants/categories';

const CATEGORY_BY_ID: Record<string, (typeof CATEGORIES)[number]> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c])
);

// Lowercase + strip Albanian diacritics (ë→e, ç→c) so "makinë" and "makine" match.
const normalize = (s: string) =>
  s.toLowerCase().replace(/ë/g, 'e').replace(/ç/g, 'c');

interface AppContextType {
  listings: Listing[];
  currentUser: User;
  users: User[];
  chats: Chat[];
  messages: Record<string, Message[]>;
  favorites: string[];
  searchQuery: string;
  filters: SearchFilters;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'views' | 'sellerId' | 'sellerName'>) => void;
  toggleFavorite: (listingId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  sendMessage: (chatId: string, text: string) => void;
  getFilteredListings: () => Listing[];
  getListingsByCategory: (categoryId: string) => Listing[];
  getUserById: (userId: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [currentUser] = useState<User>(CURRENT_USER);
  const [users] = useState<User[]>(MOCK_USERS);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [favorites, setFavorites] = useState<string[]>(CURRENT_USER.favorites);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ sortBy: 'newest' });

  const addListing = useCallback((listing: Omit<Listing, 'id' | 'createdAt' | 'views' | 'sellerId' | 'sellerName'>) => {
    const newListing: Listing = {
      ...listing,
      id: generateId(),
      createdAt: new Date().toISOString(),
      views: 0,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
    };
    setListings(prev => [newListing, ...prev]);
  }, [currentUser]);

  const toggleFavorite = useCallback((listingId: string) => {
    setFavorites(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  }, []);

  const sendMessage = useCallback((chatId: string, text: string) => {
    const newMessage: Message = {
      id: generateId(),
      chatId,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, lastMessage: text, lastMessageTime: newMessage.timestamp }
          : chat
      )
    );
  }, [currentUser.id]);

  const getFilteredListings = useCallback(() => {
    let result = [...listings];

    if (searchQuery.trim()) {
      const q = normalize(searchQuery.trim());
      result = result.filter(l => {
        const cat = CATEGORY_BY_ID[l.category];
        const haystack = normalize([
          l.title,
          l.description,
          l.location,
          l.subcategory || '',
          cat ? cat.name : '',
          cat && cat.keywords ? cat.keywords.join(' ') : '',
        ].join(' '));
        return haystack.includes(q);
      });
    }

    if (filters.category) {
      result = result.filter(l => l.category === filters.category);
    }
    if (filters.location) {
      result = result.filter(l => l.location === filters.location);
    }
    if (filters.condition) {
      result = result.filter(l => l.condition === filters.condition);
    }
    if (filters.minPrice !== undefined) {
      result = result.filter(l => l.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(l => l.price <= filters.maxPrice!);
    }

    switch (filters.sortBy) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [listings, searchQuery, filters]);

  const getListingsByCategory = useCallback((categoryId: string) => {
    return listings.filter(l => l.category === categoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [listings]);

  const getUserById = useCallback((userId: string) => {
    return users.find(u => u.id === userId);
  }, [users]);

  return (
    <AppContext.Provider value={{
      listings, currentUser, users, chats, messages, favorites,
      searchQuery, filters,
      addListing, toggleFavorite, setSearchQuery, setFilters,
      sendMessage, getFilteredListings, getListingsByCategory, getUserById,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
