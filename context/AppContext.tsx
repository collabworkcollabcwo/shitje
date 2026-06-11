import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing, User, Chat, Message, SearchFilters } from '../types';
import { MOCK_LISTINGS, MOCK_CHATS, MOCK_MESSAGES, CURRENT_USER, MOCK_USERS } from '../data/mock';
import { generateId } from '../utils/format';
import { CATEGORIES } from '../constants/categories';
import { useAuth } from './AuthContext';
import { cloudEnabled, fetchCloudListings, upsertCloudListing, deleteCloudListing, uploadCloudImage } from '../utils/cloud';

const CATEGORY_BY_ID: Record<string, (typeof CATEGORIES)[number]> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c])
);

const FAVORITES_KEY = 'shitje.favorites';
const MY_LISTINGS_KEY = 'shitje.myListings';
const REMOVED_KEY = 'shitje.removedListings';
const SOLD_KEY = 'shitje.soldListings';

// Lowercase + strip Albanian diacritics (ë→e, ç→c) so "makinë" and "makine" match.
const normalize = (s: string) =>
  s.toLowerCase().replace(/ë/g, 'e').replace(/ç/g, 'c');

// Canned seller replies for the simulated conversation, so chats feel alive.
const AUTO_REPLIES = [
  'Po, ende është në shitje. Jeni të interesuar?',
  'Mund të takohemi kur të doni, jam fleksibël me orarin.',
  'Çmimi është pak i diskutueshëm, bëni një ofertë.',
  'Po, gjendja është pikërisht si në foto.',
  'Faleminderit për interesimin! Më shkruani kur të vendosni.',
  'Mund t\'jua tregoj edhe me video-thirrje nëse doni.',
];

interface AppContextType {
  listings: Listing[];
  currentUser: User;
  users: User[];
  chats: Chat[];
  messages: Record<string, Message[]>;
  favorites: string[];
  searchQuery: string;
  filters: SearchFilters;
  /** Chats where the other person is "typing" a simulated reply. */
  typingChats: Record<string, boolean>;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'views' | 'sellerId' | 'sellerName'>) => string;
  deleteListing: (listingId: string) => void;
  toggleSold: (listingId: string) => void;
  toggleFavorite: (listingId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  sendMessage: (chatId: string, text: string) => void;
  markChatRead: (chatId: string) => void;
  /** Find (or create) the chat for a listing and return its id. */
  getOrCreateChat: (listing: Listing) => string;
  /** Count a view for a listing — at most once per session. */
  registerView: (listingId: string) => void;
  getFilteredListings: () => Listing[];
  getListingsByCategory: (categoryId: string) => Listing[];
  getSimilarListings: (listing: Listing, limit?: number) => Listing[];
  getUserById: (userId: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  // The signed-in account acts as the app's current user; the mock "Flori"
  // account remains the guest identity for demo data (chats, etc.).
  const currentUser: User = useMemo(
    () =>
      authUser
        ? {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            avatar: authUser.avatar,
            location: 'Shqipëri',
            joinedAt: authUser.joinedAt,
            rating: 5,
            reviewCount: 0,
            listings: [],
            favorites: [],
          }
        : CURRENT_USER,
    [authUser]
  );
  const users = useMemo(
    () => (authUser ? [currentUser, ...MOCK_USERS] : MOCK_USERS),
    [authUser, currentUser]
  );
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [favorites, setFavorites] = useState<string[]>(CURRENT_USER.favorites);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ sortBy: 'newest' });
  const [typingChats, setTypingChats] = useState<Record<string, boolean>>({});
  const viewedThisSession = useRef<Set<string>>(new Set());
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Always-fresh user for callbacks with empty dep lists, and the set of ids
  // that came from the shared cloud (other people's listings — never persisted
  // into this device's MY_LISTINGS cache).
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const cloudIdsRef = useRef<Set<string>>(new Set());

  // ---- Persistence: restore favourites + the user's own listings on launch ----
  useEffect(() => {
    (async () => {
      try {
        const [fav, mine, removed, sold] = await Promise.all([
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(MY_LISTINGS_KEY),
          AsyncStorage.getItem(REMOVED_KEY),
          AsyncStorage.getItem(SOLD_KEY),
        ]);
        if (fav) setFavorites(JSON.parse(fav));
        const removedIds: string[] = removed ? JSON.parse(removed) : [];
        const soldIds: string[] = sold ? JSON.parse(sold) : [];
        const myListings: Listing[] = mine ? JSON.parse(mine) : [];
        setListings(prev => {
          const base = prev.filter(l => !removedIds.includes(l.id));
          const merged = [...myListings.filter(m => !base.some(b => b.id === m.id)), ...base];
          return soldIds.length
            ? merged.map(l => (soldIds.includes(l.id) ? { ...l, isSold: true } : l))
            : merged;
        });

        // Shared backend configured → pull everyone's listings and merge them in.
        // Cloud versions win for user-created ids (e.g. sold on another device).
        if (cloudEnabled()) {
          try {
            const cloud = await fetchCloudListings();
            cloud.forEach(c => cloudIdsRef.current.add(c.id));
            setListings(prev => {
              const cloudById = new Map(cloud.map(c => [c.id, c]));
              const refreshed = prev.map(p =>
                cloudById.has(p.id) && !MOCK_LISTINGS.some(m => m.id === p.id)
                  ? (cloudById.get(p.id) as Listing)
                  : p
              );
              const incoming = cloud.filter(
                c => !prev.some(p => p.id === c.id) && !removedIds.includes(c.id)
              );
              return [...incoming, ...refreshed];
            });
          } catch {
            // offline or backend down — keep the local view
          }
        }
      } catch {}
    })();
    return () => {
      replyTimers.current.forEach(clearTimeout);
    };
  }, []);

  const persistMine = (all: Listing[]) => {
    // Cache user-created listings on the device — but not other people's
    // cloud listings (those re-arrive from the backend on every launch).
    AsyncStorage.setItem(
      MY_LISTINGS_KEY,
      JSON.stringify(all.filter(l =>
        !MOCK_LISTINGS.some(m => m.id === l.id) &&
        (!cloudIdsRef.current.has(l.id) || l.sellerId === currentUserRef.current.id)
      ))
    ).catch(() => {});
    AsyncStorage.setItem(
      SOLD_KEY,
      JSON.stringify(all.filter(l => l.isSold).map(l => l.id))
    ).catch(() => {});
  };

  const addListing = useCallback((listing: Omit<Listing, 'id' | 'createdAt' | 'views' | 'sellerId' | 'sellerName'>) => {
    const newListing: Listing = {
      ...listing,
      id: generateId(),
      createdAt: new Date().toISOString(),
      views: 0,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
    };
    setListings(prev => {
      const next = [newListing, ...prev];
      persistMine(next);
      return next;
    });

    // Shared backend: upload the photos (local blob:/file: URIs only exist on
    // this device), then publish the document so every user sees the listing.
    if (cloudEnabled()) {
      (async () => {
        const uploaded: string[] = [];
        for (let i = 0; i < newListing.images.length; i++) {
          const uri = newListing.images[i];
          if (/^https?:/i.test(uri)) {
            uploaded.push(uri);
            continue;
          }
          const url = await uploadCloudImage(uri, `${newListing.id}_${i}.jpg`);
          if (url) uploaded.push(url);
        }
        const cloudImages = uploaded.length
          ? uploaded
          : [`https://picsum.photos/seed/${newListing.id}/600/600`];
        const cloudDoc: Listing = { ...newListing, images: cloudImages };
        if (uploaded.length) {
          // Swap in the permanent URLs locally too.
          setListings(prev => {
            const next = prev.map(l => (l.id === newListing.id ? cloudDoc : l));
            persistMine(next);
            return next;
          });
        }
        await upsertCloudListing(cloudDoc);
      })().catch(() => {});
    }
    return newListing.id;
  }, [currentUser]);

  const deleteListing = useCallback((listingId: string) => {
    setListings(prev => {
      const next = prev.filter(l => l.id !== listingId);
      persistMine(next);
      return next;
    });
    if (!MOCK_LISTINGS.some(m => m.id === listingId)) {
      deleteCloudListing(listingId).catch(() => {});
    }
    if (MOCK_LISTINGS.some(m => m.id === listingId)) {
      AsyncStorage.getItem(REMOVED_KEY)
        .then(v => {
          const removed: string[] = v ? JSON.parse(v) : [];
          if (!removed.includes(listingId)) {
            removed.push(listingId);
            return AsyncStorage.setItem(REMOVED_KEY, JSON.stringify(removed));
          }
        })
        .catch(() => {});
    }
    setFavorites(prev => {
      const next = prev.filter(id => id !== listingId);
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleSold = useCallback((listingId: string) => {
    setListings(prev => {
      const next = prev.map(l => (l.id === listingId ? { ...l, isSold: !l.isSold } : l));
      persistMine(next);
      const updated = next.find(l => l.id === listingId);
      if (updated && !MOCK_LISTINGS.some(m => m.id === listingId)) {
        upsertCloudListing(updated).catch(() => {});
      }
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((listingId: string) => {
    setFavorites(prev => {
      const next = prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
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

    // Simulate the other side: typing for a moment, then a reply.
    const typingDelay = 900 + Math.random() * 800;
    const replyDelay = typingDelay + 1200 + Math.random() * 1500;
    const t1 = setTimeout(() => {
      setTypingChats(prev => ({ ...prev, [chatId]: true }));
    }, typingDelay);
    const t2 = setTimeout(() => {
      setTypingChats(prev => ({ ...prev, [chatId]: false }));
      const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setChats(prevChats => {
        const chat = prevChats.find(c => c.id === chatId);
        if (!chat) return prevChats;
        const otherId = chat.participants.find(p => p !== currentUser.id);
        if (!otherId) return prevChats;
        const reply: Message = {
          id: generateId(),
          chatId,
          senderId: otherId,
          text: replyText,
          timestamp: new Date().toISOString(),
          read: false,
        };
        setMessages(prevMsgs => ({
          ...prevMsgs,
          [chatId]: [...(prevMsgs[chatId] || []), reply],
        }));
        return prevChats.map(c =>
          c.id === chatId
            ? { ...c, lastMessage: replyText, lastMessageTime: reply.timestamp }
            : c
        );
      });
    }, replyDelay);
    replyTimers.current.push(t1, t2);
  }, [currentUser.id]);

  const markChatRead = useCallback((chatId: string) => {
    setChats(prev =>
      prev.map(c => (c.id === chatId && c.unreadCount > 0 ? { ...c, unreadCount: 0 } : c))
    );
    setMessages(prev => {
      const msgs = prev[chatId];
      if (!msgs || msgs.every(m => m.read)) return prev;
      return { ...prev, [chatId]: msgs.map(m => ({ ...m, read: true })) };
    });
  }, []);

  const getOrCreateChat = useCallback((listing: Listing) => {
    const existing = chats.find(
      c => c.listingId === listing.id &&
        c.participants.includes(currentUser.id) &&
        c.participants.includes(listing.sellerId)
    );
    if (existing) return existing.id;

    const newChat: Chat = {
      id: generateId(),
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.images[0],
      participants: [currentUser.id, listing.sellerId],
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    };
    setChats(prev => [newChat, ...prev]);
    setMessages(prev => ({ ...prev, [newChat.id]: [] }));
    return newChat.id;
  }, [chats, currentUser.id]);

  const registerView = useCallback((listingId: string) => {
    if (viewedThisSession.current.has(listingId)) return;
    viewedThisSession.current.add(listingId);
    setListings(prev =>
      prev.map(l => (l.id === listingId ? { ...l, views: l.views + 1 } : l))
    );
  }, []);

  const getFilteredListings = useCallback(() => {
    let result = listings.filter(l => !l.isSold);

    if (searchQuery.trim()) {
      const qTokens = normalize(searchQuery.trim()).split(/\s+/).filter(Boolean);
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
        const hayTokens = haystack.split(/[^a-z0-9]+/).filter(Boolean);
        // Every typed word must match — as a substring, or sharing a prefix with
        // a word in the listing. This makes definite/plural/slang forms work too:
        // "telefoni"→"telefon", "frigoriferi"→"frigorifer", "shtepia"→"shtepi".
        return qTokens.every(qt =>
          haystack.includes(qt) ||
          hayTokens.some(ht => ht.length >= 4 && (qt.startsWith(ht) || ht.startsWith(qt)))
        );
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
    return listings.filter(l => l.category === categoryId && !l.isSold)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [listings]);

  const getSimilarListings = useCallback((listing: Listing, limit = 6) => {
    return listings
      .filter(l => l.id !== listing.id && !l.isSold && l.category === listing.category)
      .sort((a, b) => {
        // Same subcategory first, then same city, then most viewed.
        const subA = a.subcategory === listing.subcategory ? 1 : 0;
        const subB = b.subcategory === listing.subcategory ? 1 : 0;
        if (subA !== subB) return subB - subA;
        const locA = a.location === listing.location ? 1 : 0;
        const locB = b.location === listing.location ? 1 : 0;
        if (locA !== locB) return locB - locA;
        return b.views - a.views;
      })
      .slice(0, limit);
  }, [listings]);

  const getUserById = useCallback((userId: string) => {
    return users.find(u => u.id === userId);
  }, [users]);

  return (
    <AppContext.Provider value={{
      listings, currentUser, users, chats, messages, favorites,
      searchQuery, filters, typingChats,
      addListing, deleteListing, toggleSold, toggleFavorite,
      setSearchQuery, setFilters,
      sendMessage, markChatRead, getOrCreateChat, registerView,
      getFilteredListings, getListingsByCategory, getSimilarListings, getUserById,
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
