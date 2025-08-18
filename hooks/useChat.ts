import { CREATE_INVITE, READ_MESSAGE_FROM_STORE, RECEIVE_MESSAGE, SEND_MESSAGE, UPDATE_PEER_CONNECTION } from '@/constants/command.mjs';
import { rpcService } from '@/hooks/RPC';
import { addMessage, addMessageInBatchs, loadMessages, setActiveUser } from '@/Redux/chatReducer';
import { RootState } from '@/Redux/store';
import { copyToClipboard } from '@/utils/helpter';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useChat = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => Array.from(state.chat.messages.values()));
  const activeUser = useSelector((state: RootState) => state.chat.activeUser);
  const userId = useSelector((state: RootState) => state.auth.credentials.userId);
  const [text, setText] = useState('');
  const [connection, setConnection] = useState({})



  useEffect(() => {
    const readMessage = async () => {
      if (activeUser && activeUser.groupId) {
        const message = await rpcService.send(READ_MESSAGE_FROM_STORE, { groupId: activeUser.groupId }).reply()
        if (message)
          dispatch(loadMessages(message));
      }
    }
    readMessage();

    if (activeUser && activeUser.groupId) {
      rpcService.subscribe(RECEIVE_MESSAGE, (data: any) => {
        if (Array.isArray(data.message)) {
          dispatch(addMessageInBatchs(data.message));
        } else {
          dispatch(addMessage(data.message));
        }
      });

      rpcService.onRequest(UPDATE_PEER_CONNECTION, (data) => {
        const status = data[activeUser.groupId];
        if (Object.keys(data).length > 0 && status) {
          setConnection(status);
        }
      })
    }

  }, [activeUser, dispatch]);


  // useEffect(() => {
  // }, [])

  const sendMessage = async () => {
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
      console.log('Send message', newMessage);
      rpcService.send(SEND_MESSAGE, newMessage);
    } catch {
      console.error('Failed to send message:');
    }
    dispatch(addMessage(newMessage));
    setText('');
  };

  const createInvite = async () => {
    if (!activeUser?.groupId) return;
    const { invite } = await rpcService.send(CREATE_INVITE, { groupId: activeUser.groupId }).reply();
    if (invite) {
      copyToClipboard(invite);
    }
  };

  const setActiveUserInChat = (user: any) => {
    dispatch(setActiveUser(user));
  };

  return {
    messages,
    text,
    setText,
    sendMessage,
    activeUser,
    setActiveUserInChat,
    createInvite,
    connection,
    userId
  };
};
