import { styles } from '@/style/UserChatStyles';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
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
  const [messages, setMessages] = useState([
    { id: '12', type: 'message', text: 'hi how are you', sender: 'me', time: '16:35' },
    { id: '1', type: 'system', text: 's sf and You joined the room 🌤️', time: '16:33' },
    { id: '2', type: 'message', text: 'hi', sender: 'other', time: '16:34' },
    { id: '3', type: 'message', text: 'ohv', sender: 'other', time: '16:34' },
    { id: '4', type: 'message', text: 'hrh', sender: 'other', time: '16:34' },
    { id: '5', type: 'system', text: 'Message deleted', time: '16:34' },
    { id: '6', type: 'system', text: 's sf Admin', time: '16:35' },
    { id: '7', type: 'message', text: 'hi how are you', sender: 'other', time: '16:35' },
    { id: '8', type: 'message', text: 'i want to know more about you', sender: 'other', time: '16:35' },
    { id: '9', type: 'message', text: 'can you help me to do this', sender: 'other', time: '16:35' },
    { id: '10', type: 'system', text: 's sf has started a call', time: '16:36' },
    { id: '11', type: 'system', text: 'Message deleted', time: '23:41' },
  ]);

  const [text, setText] = useState('');
  const flatListRef = useRef(null);

  const sendMessage = () => {
    if (text.trim() === '') return;
    const newMsg = {
      id: Date.now().toString(),
      type: 'message',
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [newMsg, ...prev]);
    setTimeout(() => {
      const newMsg = {
        id: Date.now().toString(),
        type: 'message',
        text: 'I am new agent, can not understand human language',
        sender: 'other',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [newMsg, ...prev]);
    }, 500);
    setText('');
  };

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
