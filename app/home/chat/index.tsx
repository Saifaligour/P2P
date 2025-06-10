import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
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
      id: '12',
      type: 'message',
      text: 'hi how are you',
      sender: 'me',
      time: '16:35'
    },
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef(null);
  const inputContainerTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        Animated.timing(inputContainerTranslateY, {
          toValue: -e.endCoordinates.height,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
          }
        });
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        Animated.timing(inputContainerTranslateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
    setTimeout(() => {

      const newMsg = {
        id: Date.now().toString(),
        type: 'message',
        text: 'I am new agent,can not understand human lagnuage',
        sender: 'other',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [newMsg, ...prev]);

    });
    setText('');
    // Keyboard.dismiss();
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

      {/* Messages */}
      <KeyboardAvoidingView
        style={[
          styles.messagesWrapper,
          {
            paddingBottom: isKeyboardVisible
              ? keyboardHeight + 35  // Extra space when keyboard is open
              : 35               // Base padding
          }
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted
          contentContainerStyle={[
            styles.messagesContainer,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          onScrollToIndexFailed={() => { }}
        />
      </KeyboardAvoidingView>

      {/* Input area */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            transform: [{ translateY: inputContainerTranslateY }],
            paddingBottom: Platform.OS === 'ios' ? 30 : 20
          }
        ]}
      >
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
          onFocus={() => {
            if (flatListRef.current) {
              setTimeout(() => {
                flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
              }, 100);
            }
          }}
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
      </Animated.View>
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
  headerInfo: {
    marginLeft: 5,
    flex: 1,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
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
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginVertical: 10,
  },
  dateText: {
    color: 'gray',
    fontSize: 12,
  },
  messagesWrapper: {
    flex: 1,
  },
  messagesContainer: {
    paddingTop: 15,
    paddingHorizontal: 12,
    paddingBottom: 15,
  },
  messageContainer: {
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  myMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  messageTime: {
    fontSize: 11,
    color: 'gray',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 13,
    color: 'gray',
    textAlign: 'center',
  },
  systemMessageTime: {
    fontSize: 11,
    color: 'gray',
    textAlign: 'center',
    marginTop: 2,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: '#f0f2f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
    marginHorizontal: 5,
    minHeight: 44,
  },
  emojiButton: {
    padding: 8,
  },
  attachmentButton: {
    padding: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#075e54',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  micButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default ChatScreen;