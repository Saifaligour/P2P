// screens/JADE_Chat_Ultimate.tsx
import { createInvite, useChat, useHeader, useInputBar } from '@/hooks/useChat';
import { useThemeColor } from '@/hooks/useThemeColor';
import { createStyle } from '@/style/ChatStyles';
import { Ionicons } from '@expo/vector-icons';

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
const Header = memo(({ styles, theme, s }: any) => {
  const { activeUser, connection, goBack }: any = useHeader()
  return (
    <View style={styles.header} pointerEvents="box-none">
      <TouchableOpacity onPress={() => goBack()}>
        <Ionicons name="arrow-back" size={s(32)} color={theme.iconColor} />
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        {activeUser?.avatarType === 'name' ?
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarName}> {activeUser.avatar}</Text>
          </View>
          : <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />}
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
        <TouchableOpacity><Ionicons name="videocam" size={s(28)} color={theme.iconColor} /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="call" size={s(28)} color={theme.iconColor} /></TouchableOpacity>
        <TouchableOpacity onPress={() => createInvite(activeUser?.groupId)}><Ionicons name="link" size={s(28)} color={theme.iconColor} /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="ellipsis-vertical" size={s(28)} color={theme.iconColor} /></TouchableOpacity>
      </View>
    </View>
  );
});

Header.displayName = "Header";

const Message = memo(({ item, styles, userId, theme, s }: any) => {

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
        {
          borderTopRightRadius: isMine ? 4 : 20,
          borderTopLeftRadius: isMine ? 20 : 4,
        }
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
              color: isMine ? theme.sentText : theme.receivedText,
            },
          ]}
        >
          {item.text}
        </Text>

        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timeText,
              { color: isMine ? theme.sentTime : theme.receivedTime },
            ]}
            numberOfLines={1}
          >
            {item.timestamp}
          </Text>

          {isMine && (
            <Ionicons
              name="checkmark-done"
              size={s(16)}
              color={theme.badgeColor}
              style={styles.checkmark}

            />
          )}
        </View>
      </View>
    </View>
  )
});
Message.displayName = "Message";

// ---------------- Input Composer ----------------
const InputBar = memo(({ scrollToBottom, styles, theme, s, }: any) => {
  const {
    text, setText, handleSendText, handleSendEmoji, handlePickImage } = useInputBar(scrollToBottom)

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity>
        <Ionicons name="add-circle-outline" size={s(30)} color={theme.iconColor} />
      </TouchableOpacity>

      <TextInput
        placeholder="Type a message..."
        placeholderTextColor={theme.inputText}
        value={text}
        onChangeText={setText}
        style={styles.textInput}
        multiline
      />

      {text.trim() ? (
        <TouchableOpacity onPress={handleSendText}>
          <Ionicons name="send" size={s(26)} color={theme.iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.inputActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleSendEmoji('😊')}>
            <Ionicons name="happy-outline" size={s(26)} color={theme.iconColor} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={s(26)} color={theme.iconColor} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="mic-outline" size={s(26)} color={theme.iconColor} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
});
InputBar.displayName = "InputBar";

// ---------------- Chat Screen ----------------
const ChatScreen = () => {
  // const headerHeightValue = useHeaderHeight();
  // const headerHeight = Platform.OS === "ios" ? headerHeightValue : 0;
  const flatListRef = useRef<FlatList<any>>(null);
  const { messages, userId } = useChat();
  const { theme, s } = useThemeColor();
  const hasBgImage = !!theme.bgImage;
  const styles = useMemo(() => createStyle(theme, s, hasBgImage), [theme, s, hasBgImage]);

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
          theme={theme} s={s}
          hasBgImage={hasBgImage} styles={styles}
        />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          <FlatList
            data={messages}
            keyExtractor={(item: any) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            renderItem={({ item }) => <Message userId={userId} item={item} styles={styles} theme={theme} s={s} />}
          />

          {/* Input */}
          <InputBar
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
