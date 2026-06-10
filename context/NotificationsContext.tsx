import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
  id: string;
  icon: string; // Feather icon name
  color: string;
  title: string;
  body: string;
  createdAt: string;
  /** Route pushed when the notification is tapped. */
  route?: string;
  read: boolean;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);
const READ_KEY = 'shitje.notifications.read';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

// Seeded demo notifications (Albanian). A real backend would push these.
const SEED: Omit<AppNotification, 'read'>[] = [
  {
    id: 'n_welcome',
    icon: 'gift',
    color: '#FF6B00',
    title: 'Mirë se erdhe në Shitje! 🎉',
    body: 'Krijo një llogari falas dhe publiko shpalljen tënde të parë në 30 sekonda.',
    createdAt: hoursAgo(1),
    route: '/auth',
  },
  {
    id: 'n_messages',
    icon: 'message-circle',
    color: '#2196F3',
    title: '3 mesazhe të reja 💬',
    body: 'Shitësit të kanë kthyer përgjigje. Hap bisedat te Mesazhet.',
    createdAt: hoursAgo(3),
    route: '/(tabs)/messages',
  },
  {
    id: 'n_price',
    icon: 'trending-down',
    color: '#4CAF50',
    title: 'Çmim i diskutueshëm 📉',
    body: 'Toyota Yaris 2020 Automatik — shitësi pranon oferta. Shikoje përsëri!',
    createdAt: hoursAgo(7),
    route: '/listing/11',
  },
  {
    id: 'n_featured',
    icon: 'star',
    color: '#FFC107',
    title: 'Shpallje të veçanta pranë teje ⭐',
    body: 'iPhone 15 Pro Max dhe Mercedes C220 janë ndër më të kërkuarat këtë javë.',
    createdAt: hoursAgo(26),
    route: '/(tabs)/search',
  },
  {
    id: 'n_safety',
    icon: 'shield',
    color: '#607D8B',
    title: 'Këshillë sigurie 🛡️',
    body: 'Takohu gjithmonë në vende publike dhe verifiko artikullin para pagesës.',
    createdAt: hoursAgo(50),
    route: '/docs?section=siguria',
  },
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(READ_KEY)
      .then(v => {
        if (v) setReadIds(JSON.parse(v));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const persist = (ids: string[]) => {
    AsyncStorage.setItem(READ_KEY, JSON.stringify(ids)).catch(() => {});
  };

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      persist(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const all = SEED.map(n => n.id);
    setReadIds(all);
    persist(all);
  }, []);

  const notifications = useMemo(
    () => SEED.map(n => ({ ...n, read: readIds.includes(n.id) })),
    [readIds]
  );
  const unreadCount = loaded ? notifications.filter(n => !n.read).length : 0;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextType {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
