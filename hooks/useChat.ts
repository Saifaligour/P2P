/* eslint-disable react-hooks/exhaustive-deps */
import { CREATE_INVITE, READ_MESSAGE_FROM_STORE, RECEIVE_MESSAGE, SEND_MESSAGE } from '@/constants/command.mjs';
import { rpcService } from '@/hooks/RPC';
import { addMessage, addMessageInBatchs, loadMessages } from '@/Redux/chatReducer';
import { RootState } from '@/Redux/store';
import { copyToClipboard } from '@/utils/helpter';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector, } from 'react-redux';

export const useChat = () => {
  const dispatch = useDispatch();
  const rawMessages = useSelector((state: RootState) => state.chat.messages);
  const messages = useMemo(() => Array.from(rawMessages.values()), [rawMessages]);
  const userId = useSelector((state: RootState) => state.auth.credentials.userId);
  useEffect(() => {
    dispatch(initializeChatSession());

    const unSubscribe = rpcService.subscribe(RECEIVE_MESSAGE, (data: any) => {
      // Logic to prevent adding our own messages twice (if backend echoes them)
      if (Array.isArray(data.message)) {
        if (data.message[0]?.sender === userId) return;
        console.log('useChat, hook: RECEIVE_MESSAGE batch', data);
        dispatch(addMessageInBatchs(data.message));
      } else {
        if (data.message?.sender === userId) return;
        console.log('useChat hook: RECEIVE_MESSAGE', data);
        dispatch(addMessage(data.message));
      }
    });
    return () => unSubscribe();

  }, []);

  return {
    messages,
    userId,
  };
};


export const useHeader = () => {
  const router = useRouter();
  // Selectors
  const activeUser: any = useSelector((state: RootState) => state.chat.activeUser);
  const connection = useSelector((state: RootState) => state.chat.connection);

  // Actions
  const goBack = useCallback(() => router.back(), [router]);

  // Return exactly what the View needs
  return {
    activeUser,
    connection,
    goBack,
  };
};

export const useInputBar = (scrollToBottom: () => void) => {
  const dispatch = useDispatch();
  const [text, setText] = useState('');

  // Helper to send and scroll
  const finalizeSend = useCallback((content: string, type: string = 'message') => {
    dispatch(sendMessage(content, type));
    setTimeout(scrollToBottom, 100);
  }, [dispatch, scrollToBottom]);

  const handleSendText = useCallback(() => {
    if (text.trim()) {
      finalizeSend(text);
      setText('');
    }
  }, [text, finalizeSend]);

  const handleSendEmoji = useCallback((emoji: string) => {
    finalizeSend(emoji);
  }, [finalizeSend]);

  const handlePickImage = useCallback(async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      finalizeSend(result.assets[0].uri, 'image');
    }
  }, [finalizeSend]);

  return {
    text,
    setText,
    handleSendText,
    handleSendEmoji,
    handlePickImage
  };
};

// THUNK 1: Initialize Chat (Load Messages & Setup Global Listeners)
export const initializeChatSession: any = () => async (dispatch: any, getState: any) => {
  const state = getState();
  const { activeUser } = state.chat;
  // Validation: If no active group, stop.
  if (!activeUser || !activeUser.groupId) return;

  // 1. Load Past Messages
  try {
    const message = await rpcService
      .send(READ_MESSAGE_FROM_STORE, { groupId: activeUser.groupId })
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
  const { activeUser } = state.chat;
  const { userId } = state.auth.credentials;

  // 2. Validation
  if (!text.trim() || !activeUser?.groupId) return;

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
    groupId: activeUser.groupId,
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