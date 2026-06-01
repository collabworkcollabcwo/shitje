import React, { useState, useRef, useMemo } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/format';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { chats, messages, currentUser, sendMessage, getUserById } = useApp();
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const chat = chats.find(c => c.id === id);
  const chatMessages = messages[id || ''] || [];
  const otherId = chat?.participants.find(p => p !== currentUser.id);
  const otherUser = otherId ? getUserById(otherId) : undefined;

  if (!chat) {
    return (
      <View style={styles.notFound}>
        <Text>Biseda nuk u gjet</Text>
      </View>
    );
  }

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(id!, text.trim());
    setText('');
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: otherUser?.name || 'Bisedë',
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
                <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
                  {formatDate(item.timestamp)}
                </Text>
              </View>
            );
          }}
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
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  messageText: {
    fontSize: 15,
    color: Colors.gray[800],
    lineHeight: 20,
  },
  myMessageText: {
    color: Colors.white,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.gray[400],
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
});
