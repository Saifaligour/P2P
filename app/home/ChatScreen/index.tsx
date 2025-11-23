// screens/JADE_Chat_Ultimate.tsx
import { useChat } from '@/hooks/useChat';
import { useThemeColor } from '@/hooks/useThemeColor';
import { createStyle } from '@/style/ChatStyles';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// import { useHeaderHeight } from '@react-navigation/elements';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ---------------- Header ----------------
const Header = memo(({ activeUser, connection, createInvite, styles, theme, s, goBack }: any) => (
  <View style={styles.header} pointerEvents="box-none">
    <TouchableOpacity onPress={() => goBack()}>
      <Ionicons name="arrow-back" size={s(32)} color={theme.sentLight} />
    </TouchableOpacity>
    <View style={styles.headerInfo}>
      <Image
        source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
        style={styles.avatar}
      />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.name}>{activeUser ? activeUser.name : 'Chat'}</Text>
        <Text style={styles.status}>Online</Text>
      </View>
      <View style={{ marginLeft: 12 }}>
        {activeUser?.isGroup && connection?.current && (
          <Text style={styles.status}>{connection?.current} members</Text>
        )}
      </View>
    </View>
    <View style={styles.headerActions}>
      <TouchableOpacity><Ionicons name="videocam" size={s(28)} color={theme.sentLight} /></TouchableOpacity>
      <TouchableOpacity><Ionicons name="call" size={s(26)} color={theme.sentLight} /></TouchableOpacity>
      <TouchableOpacity onPress={createInvite}><Ionicons name="link" size={s(26)} color={theme.sentLight} /></TouchableOpacity>
      <TouchableOpacity><Ionicons name="ellipsis-vertical" size={s(24)} color={theme.sentLight} /></TouchableOpacity>
    </View>
  </View>
));
Header.displayName = "Header";

const Message = memo(({ item, userId, styles, theme, s }: any) => {
  if (item.type === 'system') {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{item.text}</Text>
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

  const isMine = item.sender === userId;
  return (
    <View
      style={[
        styles.messageContainer,
        isMine ? styles.sentContainer : styles.receivedContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isMine ? theme.sent : theme.received,
            borderTopRightRadius: isMine ? 4 : 20,
            borderTopLeftRadius: isMine ? 20 : 4,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: isMine ? '#FFFFFF' : theme.text,
              fontWeight: isMine ? '600' : '500',
            },
          ]}
        >
          {item.text}
        </Text>

        <View style={styles.messageFooter}>
          <Text style={[styles.timeText, { color: isMine ? '#FFFFFFAA' : theme.muted }]}>
            {item.timestamp}
          </Text>

          {isMine && (
            <Ionicons
              name="checkmark-done"
              size={s(18)}
              color={isMine ? theme.sentLight : theme.muted}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    </View>
  )
});
Message.displayName = "Message";

// ---------------- Input Composer ----------------
const InputBar = memo(({ text, setText, sendMessage, scrollToBottom, styles, theme, s }: any) => {
  const { sendImoji } = useChat();

  const handleSend = () => {
    if (text.trim()) {
      sendMessage();
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleSendImoji = (imoji: string) => {
    sendImoji(imoji);
    setTimeout(scrollToBottom, 100);
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      sendMessage({
        id: Date.now().toString(),
        type: 'message',
        image: imageUri,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity>
        <Ionicons name="add-circle-outline" size={s(30)} color={theme.sentLight} />
      </TouchableOpacity>

      <TextInput
        placeholder="Type a message..."
        placeholderTextColor={theme.sentLight + '88'}
        value={text}
        onChangeText={setText}
        style={styles.textInput}
        multiline
      />

      {text.trim() ? (
        <TouchableOpacity onPress={handleSend}>
          <View style={styles.sendButton}>
            <Ionicons name="send" size={s(26)} color="white" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.inputActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleSendImoji('😊')}>
            <Ionicons name="happy-outline" size={s(26)} color={theme.sentLight} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={s(26)} color={theme.sentLight} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="mic-outline" size={s(26)} color={theme.sentLight} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
});
InputBar.displayName = "InputBar";

// ---------------- Chat Screen ----------------
const ChatScreen = () => {

  const flatListRef = useRef<FlatList<any>>(null);
  const { messages, text, setText, sendMessage, activeUser, connection, userId, createInvite, goBack } = useChat();
  // const headerHeightValue = useHeaderHeight();
  // const headerHeight = Platform.OS === "ios" ? headerHeightValue : 0;

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const { theme, s } = useThemeColor();
  const hasBgImage = !!theme.bgImage;
  const styles = useMemo(() => createStyle(theme, s, hasBgImage), [theme, s, hasBgImage]);

  const BackgroundWrapper = hasBgImage ? ImageBackground : View;
  const backgroundProps: any = hasBgImage
    ? { source: { uri: theme.bgImage }, resizeMode: 'cover' }
    : { style: { backgroundColor: theme.bg } };

  return (
    <BackgroundWrapper {...backgroundProps} style={styles.container}>
      {hasBgImage && <View style={styles.overlay} />}
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="transparent" />

        {/* Header */}
        <Header
          activeUser={activeUser} connection={connection}
          createInvite={createInvite} theme={theme} s={s}
          hasBgImage={hasBgImage} styles={styles}
          goBack={goBack}
        />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          <FlatList
            data={messages}
            keyExtractor={(item: any) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            renderItem={({ item }) => <Message item={item} userId={userId} styles={styles} theme={theme} s={s} />}
          />

          {/* Input */}
          <InputBar
            text={text}
            setText={setText}
            sendMessage={sendMessage}
            scrollToBottom={scrollToBottom}
            styles={styles}
            theme={theme}
            s={s}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ChatScreen;
