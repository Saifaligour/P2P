import { RPC_CUSTOM_INPUT, RPC_JOIN_ROOM, RPC_MESSAGE } from '@/backend/rpc-commands.mjs';
import { getRPC, startRPCWorklet, stopRPCWorklet } from '@/hooks/RPC';
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
    const setupRPC = async () => {
      if (activeUser && activeUser.roomId ) {
        startRPCWorklet((command:number,data: any) => {
          console.log('Received message:', data);
            
          if (command === RPC_MESSAGE || command === RPC_JOIN_ROOM) {
            try {
    
              if (Array.isArray(data)) {
                dispatch(loadMessages(data));
              } else {
                dispatch(addMessage(data));
              }
            } catch {}
          }
        }, [activeUser.roomId]);
      }
    };
    setupRPC();
      const rpc = getRPC();
      const req = rpc.request(RPC_JOIN_ROOM);
      req.send(JSON.stringify(activeUser));
    return () => {
      stopRPCWorklet();

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
      sender: 'me',
      time: now,
      roomId: activeUser?.roomId,
    };
    try {
      const rpc = getRPC();
      const req = rpc.request(RPC_CUSTOM_INPUT);
      req.send(JSON.stringify(newMessage));
    } catch {
      console.error('Failed to send message:');
    }

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
