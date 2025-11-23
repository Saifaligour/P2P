import {
  CREATE_INVITE,
  READ_MESSAGE_FROM_STORE,
  RECEIVE_MESSAGE,
  SEND_MESSAGE,
  UPDATE_PEER_CONNECTION
} from '@/constants/command.mjs';

import { rpcService } from '@/hooks/RPC';
import {
  addMessage,
  addMessageInBatchs,
  loadMessages,
  setActiveUser
} from '@/Redux/chatReducer';

import { RootState } from '@/Redux/store';
import { copyToClipboard } from '@/utils/helpter';
import { useRouter } from 'expo-router';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

export const useChat = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // ----------------------------
  // STABLE SELECTORS
  // ----------------------------
  const messagesRaw = useSelector(
    (state: RootState) => state.chat.messages,
    shallowEqual
  );

  // FIX: Memoize derived array
  const messages = useMemo(
    () => Array.from(messagesRaw.values()),
    [messagesRaw]
  );

  const activeUser = useSelector(
    (state: RootState) => state.chat.activeUser,
    shallowEqual
  );

  const userId = useSelector(
    (state: RootState) => state.auth.credentials.userId,
    shallowEqual
  );

  const [text, setText] = useState('');
  const [connection, setConnection] = useState({});

  // ----------------------------
  // MEMO CALLBACKS
  // ----------------------------

  const sendMessage = useCallback(async () => {
    if (!text.trim()) return;

    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessage = {
      write: true,
      id: Date.now().toString(),
      type: 'message',
      text,
      sender: userId,
      timestamp: now,
      groupId: activeUser?.groupId,
    };

    try {
      rpcService.send(SEND_MESSAGE, newMessage);
    } catch {
      console.error('Failed to send message:');
    }

    dispatch(addMessage(newMessage));
    setText('');
  }, [text, userId, activeUser?.groupId, dispatch]);


  const sendImoji = useCallback(async (imoji: string) => {
    if (!imoji) return;
    setText(imoji);
    await sendMessage();
  }, [sendMessage]);


  const createInvite = useCallback(async () => {
    if (!activeUser?.groupId) return;

    const { invite } = await rpcService
      .send(CREATE_INVITE, { groupId: activeUser.groupId })
      .reply();

    if (invite) copyToClipboard(invite);
  }, [activeUser?.groupId]);


  const setActiveUserInChat = useCallback(
    (user: any) => {
      dispatch(setActiveUser(user));
    },
    [dispatch]
  );

  const goBack = useCallback(() => router.back(), [router]);

  // ----------------------------
  // MESSAGE LOADER + SUBSCRIBERS
  // ----------------------------
  useEffect(() => {
    if (!activeUser?.groupId) return;

    const readMessage = async () => {
      const message = await rpcService
        .send(READ_MESSAGE_FROM_STORE, { groupId: activeUser.groupId })
        .reply();

      if (message) dispatch(loadMessages(message));
    };

    readMessage();

    const unsubscribeMsg = rpcService.subscribe(RECEIVE_MESSAGE, (data: any) => {
      if (Array.isArray(data.message)) {
        dispatch(addMessageInBatchs(data.message));
      } else {
        dispatch(addMessage(data.message));
      }
    });

    rpcService.onRequest(UPDATE_PEER_CONNECTION, (data) => {
      const status = data[activeUser.groupId];
      if (status) setConnection(status);
    });

    return () => {
      unsubscribeMsg();
      rpcService.offRequest(UPDATE_PEER_CONNECTION);
    };
  }, [activeUser?.groupId, dispatch]);

  // ----------------------------
  // RETURN STABLE VALUES
  // ----------------------------
  return {
    messages,
    text,
    setText,
    sendMessage,
    activeUser,
    setActiveUserInChat,
    createInvite,
    connection,
    userId,
    sendImoji,
    goBack,
  };
};
