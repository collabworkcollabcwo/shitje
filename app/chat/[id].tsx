import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/format';

/** Three softly pulsing dots shown while the other person is "typing". */
function TypingDots({ color }: { color: string }) {
  const anims = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;

  useEffect(() => {
    const loops = anims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(a, { toValue: 1, duration: 320, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(a, { toValue: 0.3, duration: 320, useNativeDriver: Platform.OS !== 'web' }),
        ])
      )
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 4, paddingVertical: 4 }}>
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, opacity: a }}
        />
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { chats, messages, currentUser, sendMessage, markChatRead, typingChats, getUserById } = useApp();
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const chat = chats.find(c => c.id === id);
  const chatMessages = messages[id || ''] || [];
  const otherId = chat?.participants.find(p => p !== currentUser.id);
  const otherUser = otherId ? getUserById(otherId) : undefined;
  const isTyping = !!typingChats[id || ''];

  // Opening the conversation clears its unread badge.
  useEffect(() => {
    if (id) markChatRead(id);
  }, [id, chatMessages.length, markChatRead]);

  // Keep the view pinned to the newest message (also when the reply arrives).
  useEffect(() => {
    const t = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [chatMessages.length, isTyping]);

  if (!chat) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: Colors.gray[500] }}>Biseda nuk u gjet</Text>
      </View>
    );
  }

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(id!, text.trim());
    setText('');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isTyping ? `${otherUser?.name || 'Bisedë'} · po shkruan...` : (otherUser?.name || 'Bisedë'),
          headerBackTitle: 'Prapa',
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <Pressable
          style={styles.listingBar}
          onPress={() => router.push(`/listing/${chat.listingId}`)}
        >
          <Feather name="tag" size={14} color={Colors.primary} />
          <Text style={styles.listingBarText} numberOfLines={1}>{chat.listingTitle}</Text>
          <Feather name="chevron-right" size={16} color={Colors.gray[400]} />
        </Pressable>

        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUser.id;
            return (
              <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
                <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                  {item.text}
                </Text>
                <View style={styles.timeRow}>
                  <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
                    {formatTime(item.timestamp)}
                  </Text>
                  {isMe && (
                    <Feather
                      name={item.read ? 'check-circle' : 'check'}
                      size={11}
                      color="rgba(255,255,255,0.7)"
                    />
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Feather name="message-circle" size={40} color={Colors.gray[300]} />
              <Text style={styles.emptyChatText}>
                Fillo bisedën — pyet për çmimin, gjendjen ose takimin.
              </Text>
            </View>
          }
          ListFooterComponent={
            isTyping ? (
              <View style={[styles.messageBubble, styles.otherMessage, styles.typingBubble]}>
                <TypingDots color={Colors.gray[500]} />
              </View>
            ) : null
          }
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Shkruaj mesazh..."
            placeholderTextColor={Colors.gray[400]}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Feather name="send" size={20} color={Colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  listingBarText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  typingBubble: {
    paddingVertical: 8,
  },
  messageText: {
    fontSize: 15,
    color: Colors.gray[800],
    lineHeight: 20,
  },
  myMessageText: {
    color: Colors.white,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.gray[400],
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyChatText: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 28,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: Colors.gray[900],
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
});
