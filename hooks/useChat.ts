/* eslint-disable react-hooks/exhaustive-deps */
import { CREATE_INVITE, READ_MESSAGE_FROM_STORE, RECEIVE_MESSAGE, SEND_MESSAGE } from '@/constants/command.mjs';
import { rpcService } from '@/hooks/RPC';
import { addMessage, loadMessages } from '@/Redux/chatReducer';
import { RootState } from '@/Redux/store';
import { copyToClipboard } from '@/utils/helpter';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager, Platform } from "react-native";
import { useDispatch, useSelector, } from 'react-redux';

export const useChat = () => {
  const flatListRef = useRef<any>(null)
  const dispatch = useDispatch();
  const rawMessages = useSelector((state: RootState) => state.chat.messages);
  const messages = useMemo(() => Array.from(rawMessages.values()).reverse(), [rawMessages]);
  const userId = useSelector((state: RootState) => state.auth.credentials.userId);
  useEffect(() => {
    dispatch(initializeChatSession());

    const unSubscribe = rpcService.subscribe(RECEIVE_MESSAGE, (data: any) => {
      // Logic to prevent adding our own messages twice (if backend echoes them)
      if (data) {
        if (data.message?.sender === userId) return;
        console.log('useChat hook: RECEIVE_MESSAGE', data);
        dispatch(addMessage(data.message));
      }
    });
    return () => unSubscribe();

  }, []);

  const [isNearBottom, setIsNearBottom] = useState(true);
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsNearBottom(offsetY <= 50); // consider near bottom if within 50px
  };

  // Auto-scroll only if user is near bottom
  useEffect(() => {
    if (!flatListRef.current || !isNearBottom) return;
    // Ensure layout is complete before scrolling
    const id = requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });

    return () => cancelAnimationFrame(id);
  }, [messages, isNearBottom]);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  return {
    messages,
    userId,
    scrollToBottom,
    handleScroll,
    flatListRef
  };
};


export const useHeader = () => {
  const router = useRouter();
  // Selectors
  const activeChat: any = useSelector((state: RootState) => state.chat.activeChat);
  const connection = useSelector((state: RootState) => state.chat.connection);

  // Actions
  const goBack = useCallback(() => router.back(), [router]);

  // Return exactly what the View needs
  return {
    activeChat,
    connection,
    goBack,
  };
};

export const useInputBar = (
  scrollToBottom: () => void,
  sendOnEnter: boolean
) => {
  const dispatch = useDispatch();
  const [text, setText] = useState('');

  const textRef = useRef('');
  textRef.current = text;

  const send = useCallback((content: string, type: string = "message") => {
    if (!content.trim()) return;

    dispatch(sendMessage(content, type));

    InteractionManager.runAfterInteractions(() => setText(""));
    scrollToBottom();
  }, [dispatch, scrollToBottom]);

  const handleSendText = useCallback(() => {
    send(textRef.current.trim());
  }, [send]);

  const handleSendEmoji = useCallback((emoji: string) => {
    send(emoji);
  }, [send]);

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      send(result.assets[0].uri, "image");
    }
  }, [send]);


  // Core multiline + Enter logic
  const handleChangeText = useCallback(
    (t: string) => {
      const cleaned = t.replace(/\r|\n/g, "");
      const hasNewline = t.includes("\n") || t.includes("\r");

      if (!hasNewline) {
        // Normal typing
        setText(cleaned);
        return;
      }

      if (sendOnEnter) {
        // ENTER = send
        if (cleaned.trim()) send(cleaned.trim());
        InteractionManager.runAfterInteractions(() => setText(""));
      } else {
        // ENTER = insert newline
        setText(prev => prev + "\n");
      }
    },
    [sendOnEnter, send]
  );


  // iOS onSubmitEditing only fires if blurOnSubmit = true
  const handleSubmitEditing = useCallback(() => {
    if (!sendOnEnter) return; // disabled
    if (Platform.OS === "ios") {
      const msg = textRef.current.trim();
      if (msg) send(msg);
    }
  }, [sendOnEnter, send]);


  return {
    text,
    handleChangeText,
    handleSubmitEditing,
    handleSendText,
    handlePickImage,
    handleSendEmoji,
  };
};



// THUNK 1: Initialize Chat (Load Messages & Setup Global Listeners)
export const initializeChatSession: any = () => async (dispatch: any, getState: any) => {
  const state = getState();
  const { activeChat } = state.chat;
  // Validation: If no active group, stop.
  if (!activeChat || !activeChat.groupId) return;

  // 1. Load Past Messages
  try {
    const message = await rpcService
      .send(READ_MESSAGE_FROM_STORE, { groupId: activeChat.groupId })
      .reply();

    if (message) {
      dispatch(loadMessages(message));
    }
  } catch (error) {
    console.error('Failed to load messages from store:', error);
  }
};


// THUNK 2: Send Message
export const sendMessage: any = (text: any, type: string = 'message') => async (dispatch: any, getState: any) => {
  // 1. Get State
  const state = getState();
  const { activeChat } = state.chat;
  const { userId } = state.auth.credentials;

  // 2. Validation
  if (!text.trim() || !activeChat?.groupId) return;

  const now = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const newMessage = {
    text,
    write: true,
    type: type,
    sender: userId,
    timestamp: now,
    groupId: activeChat.groupId,
    id: Date.now().toString(),
  };

  // 3. Optimistic Update (Update Redux immediately)
  dispatch(addMessage(newMessage));

  // 4. Async Side Effect (RPC Call)
  try {
    console.log('Thunk: Sending message', newMessage);
    rpcService.send(SEND_MESSAGE, newMessage);
  } catch (error) {
    console.error('Failed to send message:', error);
    // Optional: Dispatch a failure action here to remove the message from UI
  }
};

export const createInvite = async (groupId) => {
  if (!groupId) return;
  const { invite } = await rpcService.send(CREATE_INVITE, { groupId: groupId }).reply();
  if (invite) {
    copyToClipboard(invite);
  }
};