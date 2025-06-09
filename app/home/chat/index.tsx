import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'system',
      text: 's sf and You joined the room 🌤️',
      time: '16:33'
    },
    {
      id: '2',
      type: 'message',
      text: 'hi',
      sender: 'other',
      time: '16:34'
    },
    {
      id: '3',
      type: 'message',
      text: 'ohv',
      sender: 'other',
      time: '16:34'
    },
    {
      id: '4',
      type: 'message',
      text: 'hrh',
      sender: 'other',
      time: '16:34'
    },
    {
      id: '5',
      type: 'system',
      text: 'Message deleted',
      time: '16:34'
    },
    {
      id: '6',
      type: 'system',
      text: 's sf Admin',
      time: '16:35'
    },
    {
      id: '7',
      type: 'message',
      text: 'hi how are you',
      sender: 'other',
      time: '16:35'
    },
    {
      id: '8',
      type: 'message',
      text: 'i want to know more about you',
      sender: 'other',
      time: '16:35'
    },
    {
      id: '9',
      type: 'message',
      text: 'can you help me to do this',
      sender: 'other',
      time: '16:35'
    },
    {
      id: '10',
      type: 'system',
      text: 's sf has started a call',
      time: '16:36'
    },
    {
      id: '11',
      type: 'system',
      text: 'Message deleted',
      time: '23:41'
    }
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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [newMsg, ...prev]);
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
      <View style={[
        styles.messageContainer,
        item.sender === 'me' ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          item.sender === 'me' ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
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
          <Text style={styles.roomName}>tsdfs</Text>
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
      
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Input area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.emojiButton}>
          <Ionicons name="happy-outline" size={24} color="gray" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.attachmentButton}>
          <Ionicons name="attach-outline" size={24} color="gray" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          value={text}
          onChangeText={setText}
          multiline
        />
        
        {text ? (
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic-outline" size={24} color="gray" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f2f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#075e54',
  },
  memberCount: {
    fontSize: 12,
    color: 'gray',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 5,
  },
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: '#e5ddd5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginVertical: 10,
  },
  dateText: {
    color: 'gray',
    fontSize: 12,
  },
  messagesContainer: {
    paddingTop: 10,
    paddingBottom: 70,
  },
  messageContainer: {
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  myMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 0,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  messageTime: {
    fontSize: 10,
    color: 'gray',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  systemMessageTime: {
    fontSize: 10,
    color: 'gray',
    textAlign: 'center',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingBottom: 15, // Increased from default to move up
    backgroundColor: '#f0f2f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: Platform.OS === 'ios' ? 5 : 0
  },
  emojiButton: {
    padding: 8,
  },
  attachmentButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    marginHorizontal: 5,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#075e54',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  micButton: {
    padding: 8,
    marginLeft: 5,
  },
});

export default ChatScreen;