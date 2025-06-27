import { JOIN_GROUP, LEAVE_GROUP, READ_MESSAGE_FROM_STORE, RECEIVE_MESSAGE, RPC_LOG, SEND_MESSAGE } from '@/backend/rpc-commands.mjs';
import { rpcService } from '@/hooks/RPC';
import { addMessage, loadMessages, setActiveUser } from '@/Redux/chatReducer';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useChat = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: any) => state.chat.messages);
  const activeUser = useSelector((state: any) => state.chat.activeUser);
  const [text, setText] = useState('');
  // Setup and teardown RPC for chat room

  useEffect(() => {

    if (activeUser && activeUser.groupId) {
      rpcService.onRequest(RECEIVE_MESSAGE, (data: any) => {
        console.log('data recveid from peer', data)
        if (Array.isArray(data)) {
          dispatch(loadMessages(data));
        } else {
          dispatch(addMessage(data));
        }
      });

      rpcService.onRequest(RPC_LOG, (data: any) => console.log(data));
      rpcService.send(JOIN_GROUP, activeUser.groupId);
      rpcService.send(READ_MESSAGE_FROM_STORE, activeUser.groupId)
    }
    return () => {
      const res = rpcService.send(LEAVE_GROUP, activeUser.groupId).reply()
      const message = rpcService.decode(res) || []
      console.log('Read message ', message.length);
      dispatch(loadMessages(message));
    };
  }, [activeUser, dispatch]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newMessage = {
      id: Date.now().toString(),
      type: 'message',
      text,
      sender: 'other',
      timestamp: now,
      groupId: activeUser?.groupId,
    };
    try {

      rpcService.send(SEND_MESSAGE, [newMessage]);
    } catch {
      console.error('Failed to send message:');
    }
    newMessage.sender = 'me'
    dispatch(addMessage(newMessage));
    setText('');
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
  };
};
