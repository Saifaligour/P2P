import { BackButton } from '@/components/ui/BackButton';
import { useChat } from '@/hooks/useChat';
import { styles } from '@/style/ChatStyles';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Header Component
const Header = memo(({ activeUser }: { activeUser: any }) => {
  return (
    <View style={styles.header}>
      <BackButton style={styles.backButton} color="#333" size={24} />
      <View style={styles.headerInfo}>
        <Text style={styles.roomName}>{activeUser ? activeUser.name : 'Chat'}</Text>
        {activeUser && activeUser.isGroup && (
          <Text style={styles.memberCount}>{activeUser.members?.length || 1} members</Text>
        )}
      </View>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="videocam" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="call" size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="ellipsis-vertical" size={22} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
});
Header.displayName = "Header";

// Message Component (individual message render)
const Message = memo(({ item }:any) => {
  if (item.type === 'system') {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{item.text}</Text>
        <Text style={styles.systemMessageTime}>{item.time}</Text>
      </View>
    );
  }
  if (item.type === 'date') {
    return (
     <View style={styles.dateSeparator}>
        <Text style={styles.dateText}>{item.text}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'me' ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.sender === 'me' ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>{item.time}</Text>
      </View>
    </View>
  );
});
Message.displayName = "Message";

// Message List Component
const MessageList = memo(({ messages, flatListRef, renderMessage }:any) => (
  <FlatList
    ref={flatListRef}
    data={messages}
    renderItem={renderMessage}
    keyExtractor={(item) => item.id}
    inverted
    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 90, paddingTop: 10 }}
    showsVerticalScrollIndicator={false}
    keyboardDismissMode="interactive"
  />
));
MessageList.displayName = "MessageList";

// Input Bar Component
const InputBar = memo(({ text, setText, sendMessage }:any) => (
  <View style={styles.inputWrapper}>
    <TouchableOpacity style={styles.iconButton}>
      <Ionicons name="add" size={24} color="#00BFFF" />
    </TouchableOpacity>

    <TextInput
      placeholder="Type a message"
      placeholderTextColor="#ccc"
      value={text}
      onChangeText={setText}
      style={styles.textInput}
      multiline
    />

    <TouchableOpacity style={styles.iconButton}>
      <Ionicons name="happy-outline" size={24} color="#00BFFF" />
    </TouchableOpacity>

    {text.trim() ? (
      <TouchableOpacity style={styles.iconButton} onPress={sendMessage}>
        <Ionicons name="send" size={22} color="#00BFFF" />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="mic" size={24} color="#00BFFF" />
      </TouchableOpacity>
    )}
  </View>
));
InputBar.displayName = "InputBar";


const ChatScreen = () => {
  const flatListRef = useRef(null);
  const { messages, text, setText, sendMessage, activeUser } = useChat();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
      <Header activeUser={activeUser} />
  
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={90}
      >
        <MessageList
          messages={messages}
          flatListRef={flatListRef}
          renderMessage={({ item }) => <Message item={item} />}
        />

        <InputBar text={text} setText={setText} sendMessage={sendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
