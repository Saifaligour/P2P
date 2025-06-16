import { useChat } from '@/hooks/useChat';
import { styles } from '@/style/ChatStyles';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const ChatScreen = () => {

  const flatListRef = useRef(null)
  const { messages, text, setText, sendMessage } = useChat();

  const renderMessage = ({ item }) => {
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
  };

  const renderInputBar = () => {
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#075e54" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.roomName}>saif</Text>
          <Text style={styles.memberCount}>2 members</Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="videocam" size={24} color="#075e54" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="call" size={20} color="#075e54" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-vertical" size={20} color="#075e54" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date separator */}
      <View style={styles.dateSeparator}>
        <Text style={styles.dateText}>Thursday, 5</Text>
      </View>

      {/* Messages + Input */}
     <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 90, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        />
         
        {renderInputBar()}
      
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
