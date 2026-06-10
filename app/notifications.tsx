import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';
import { useNotifications, AppNotification } from '../context/NotificationsContext';
import { formatDate } from '../utils/format';

export default function NotificationsScreen() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const open = (n: AppNotification) => {
    markRead(n.id);
    if (n.route) router.push(n.route as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Njoftimet',
          headerRight: () =>
            unreadCount > 0 ? (
              <Pressable onPress={markAllRead} hitSlop={8}>
                <Text style={styles.markAll}>Shëno të lexuara</Text>
              </Pressable>
            ) : null,
        }}
      />
      <FlatList
        style={styles.container}
        data={notifications}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, !item.read && styles.cardUnread, pressed && { opacity: 0.85 }]}
            onPress={() => open(item)}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.color + '1E' }]}>
              <Feather name={item.icon as any} size={19} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
                  {item.title}
                </Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell-off" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>Asnjë njoftim</Text>
          </View>
        }
      />
    </>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 12, gap: 10 },
  markAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  cardUnread: {
    borderColor: Colors.primary + '55',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flex: 1, fontSize: 14.5, fontWeight: '600', color: Colors.gray[700] },
  titleUnread: { fontWeight: '800', color: Colors.secondary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  body: { fontSize: 13, color: Colors.gray[500], lineHeight: 18, marginTop: 2 },
  time: { fontSize: 11, color: Colors.gray[400], marginTop: 6 },
  empty: { alignItems: 'center', paddingTop: 90, gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray[500] },
});
