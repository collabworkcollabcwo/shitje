import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { formatDate, truncate } from '../../utils/format';

export default function MessagesScreen() {
  const router = useRouter();
  const { chats, currentUser, getUserById, typingChats } = useApp();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const getOtherUser = (chat: typeof chats[0]) => {
    const otherId = chat.participants.find(id => id !== currentUser.id);
    return otherId ? getUserById(otherId) : undefined;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mesazhet</Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const otherUser = getOtherUser(item);
          return (
            <Pressable
              style={styles.chatCard}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <Image
                source={{ uri: item.listingImage }}
                style={styles.avatar}
              />
              <View style={styles.chatInfo}>
                <View style={styles.chatTop}>
                  <Text style={styles.chatName}>{otherUser?.name || 'Përdorues'}</Text>
                  <Text style={styles.chatTime}>{formatDate(item.lastMessageTime)}</Text>
                </View>
                <Text style={styles.listingRef} numberOfLines={1}>
                  {item.listingTitle}
                </Text>
                {typingChats[item.id] ? (
                  <Text style={styles.typingText} numberOfLines={1}>po shkruan...</Text>
                ) : (
                  <Text
                    style={[styles.chatMessage, item.unreadCount > 0 && styles.chatMessageUnread]}
                    numberOfLines={1}
                  >
                    {item.lastMessage ? truncate(item.lastMessage, 50) : 'Bisedë e re — thuaj përshëndetje!'}
                  </Text>
                )}
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="message-circle" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>Asnjë mesazh</Text>
            <Text style={styles.emptyText}>Filloni një bisedë duke kontaktuar një shitës</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.secondary, letterSpacing: -0.8 },
  list: { paddingTop: 8 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: Colors.gray[200],
  },
  chatInfo: {
    flex: 1,
  },
  chatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.secondary,
  },
  chatTime: {
    fontSize: 11,
    color: Colors.gray[400],
  },
  listingRef: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 2,
  },
  chatMessage: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  chatMessageUnread: {
    color: Colors.secondary,
    fontWeight: '600',
  },
  typingText: {
    fontSize: 13,
    color: Colors.primary,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 100,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.gray[600] },
  emptyText: { fontSize: 14, color: Colors.gray[400], textAlign: 'center' },
});
