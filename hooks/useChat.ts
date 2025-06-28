import { JOIN_GROUP, LEAVE_GROUP, READ_MESSAGE_FROM_STORE, RECEIVE_MESSAGE, RPC_LOG, SEND_MESSAGE, UPDATE_PEER_CONNECTION } from '@/backend/rpc-commands.mjs';
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
      rpcService.send(JOIN_GROUP, activeUser);
      rpcService.onRequest(UPDATE_PEER_CONNECTION, (data) => {
        console.log('peet connection', data)
        const status = new Map(data).get(activeUser.groupId)
        console.log(status);

      })
    }
    return () => {
      rpcService.send(LEAVE_GROUP, activeUser)
    };
  }, [activeUser, dispatch]);

  const readMessage = async () => {
    if (activeUser && activeUser.groupId) {
      const res = await rpcService.send(READ_MESSAGE_FROM_STORE, { groupId: activeUser.groupId }).reply()
      const message = rpcService.decode(res) || []
      console.log('Read message ', message);
      dispatch(loadMessages(message));
    }
  }
  useEffect(() => {
    readMessage()
  }, [])

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
