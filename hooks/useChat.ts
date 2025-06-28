import { GENERATE_HASH, JOIN_GROUP, LEAVE_GROUP, READ_MESSAGE_FROM_STORE, RECEIVE_MESSAGE, RPC_LOG, SEND_MESSAGE, UPDATE_PEER_CONNECTION } from '@/backend/rpc-commands.mjs';
import { rpcService } from '@/hooks/RPC';
import { addMessage, addMessageInBatchs, loadMessages, setActiveUser, setGroupIdHash } from '@/Redux/chatReducer';
import store, { RootState } from '@/Redux/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useChat = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.chat.messages);
  const activeUser = useSelector((state: RootState) => state.chat.activeUser);
  const [text, setText] = useState('');
  const [connection, setConnection] = useState({})



  useEffect(() => {
    const readMessage = async () => {
      if (activeUser && activeUser.groupId && messages.length === 0) {
        const res = await rpcService.send(READ_MESSAGE_FROM_STORE, { groupId: activeUser.groupId }).reply()
        const message = rpcService.decode(res)
        console.log('Read message ', message);
        if (message)
          dispatch(addMessageInBatchs(message));
      }
    }
    const generateHash = async () => {
      const groupIdHash = store.getState()?.chat?.groupIdHash;
      if (groupIdHash !== null) return

      const res = await rpcService.send(GENERATE_HASH, { groupId: activeUser.groupId }).reply()
      const result = rpcService.decode(res)
      console.log('topic hash', result.hash);
      dispatch(setGroupIdHash(result.hash))
    }
    if (activeUser && activeUser.groupId) {
      generateHash()
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
        const groupIdHash = store.getState()?.chat?.groupIdHash;
        console.log('peer connection', data)
        if (data.length) {
          const status = new Map(data).get(groupIdHash)
          console.log('status', status);
          setConnection(status);
        }
      })
    }

    readMessage()

    return () => {
      rpcService.send(LEAVE_GROUP, activeUser)
    };
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
    connection
  };
};
