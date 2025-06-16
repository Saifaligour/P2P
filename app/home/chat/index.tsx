import { useChat } from '@/hooks/useChat';
import { styles } from '@/style/ChatStyles';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Header Component
const ChatHeader = () => (
  <View style={styles.header}>
  <TouchableOpacity style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color="#333" />
  </TouchableOpacity>

  <View style={styles.headerInfo}>
    {/* You can add an avatar or icon here if you want */}
    <Text style={styles.roomName}>Saif</Text>
    <Text style={styles.memberCount}>2 members</Text>
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

// Input Bar Component
type InputBarProps = {
  text: string;
  setText: (text: string) => void;
  sendMessage: () => void;
};

const InputBar = React.memo(({ text, setText, sendMessage }: InputBarProps) => {
  return (
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
  );
});
InputBar.displayName = "InputBar";

// Message List Component
type Message = {
  id: string;
  text: string;
  time: string;
  sender?: string;
  type?: string;
};

type MessageListProps = {
  messages: Message[];
  renderMessage: ({ item }: { item: Message }) => React.JSX.Element;
  flatListRef: React.RefObject<FlatList<Message>>;
};

const MessageList = React.memo(({ messages, renderMessage, flatListRef }: MessageListProps) => {
  return (
    <>
      {/* Date separator */}
      {/* <View style={styles.dateSeparator}>
        <Text style={styles.dateText}>Thursday, 5</Text>
      </View> */}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 30, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      />
    </>
  );
});
MessageList.displayName = "MessageList";

const ChatScreen = () => {
  const flatListRef = useRef(null);
  const { messages, text, setText, sendMessage } = useChat();

  // Use useCallback to memoize the render function to prevent unnecessary re-renders
  const renderMessage = useCallback(({ item }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
          <Text style={styles.systemMessageTime}>{item.time}</Text>
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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />

      <ChatHeader />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={'padding'}
        keyboardVerticalOffset={90}
      >
        <MessageList messages={messages} renderMessage={renderMessage} flatListRef={flatListRef} />
        <InputBar text={text} setText={setText} sendMessage={sendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
