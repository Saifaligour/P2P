import { addMessage, loadMessages, setActiveUser } from '@/Redux/chatReducer';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useChat = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: any) => state.chat.messages);
  const activeUser = useSelector((state: any) => state.chat.activeUser);
  const [text, setText] = useState('');

  // Simulated fetch of messages on mount
  useEffect(() => {
    const dummyMessages = [
      { id: '1', type: 'system', text: 'You joined the room', time: '16:30' },
      { id: '2', type: 'message', text: 'Hey there!', sender: 'other', time: '16:31' },
      { id: '3', type: 'date', text: 'Thrusday, 5', sender: 'me', time: '16:32' },
      { id: '4', type: 'message', text: 'How are you?', sender: 'me', time: '16:32' },
    ];

    dispatch(loadMessages(dummyMessages));
  }, [dispatch]);

  // Join room when activeUser changes, only once per unique roomId
  const lastJoinedRoomId = useRef<string | null>(null);
  const joinRoomCalled = useRef(false);
  useEffect(() => {
    const joinRoom = async () => {
      if (
        activeUser &&
        activeUser.roomId &&
        activeUser.roomId !== lastJoinedRoomId.current
      ) {
        try {
          if (!joinRoomCalled.current) {
            joinRoomCalled.current = true;
            console.log(`Joining room: ${activeUser.roomId}`);
            lastJoinedRoomId.current = activeUser.roomId;
            // Place your join logic here (e.g., API call)
          }
        } catch {
          // Optionally: handle error
        }
      }
    };
    joinRoom();
    // Reset joinRoomCalled if activeUser changes to null or a different room
    if (!activeUser || activeUser.roomId !== lastJoinedRoomId.current) {
      joinRoomCalled.current = false;
    }
  }, [activeUser]);

  const sendMessage = () => {
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
    };
    
    dispatch(addMessage(newMessage));
    setText('');

    // Simulate auto reply
    setTimeout(() => {
      dispatch(
        addMessage({
          id: (Date.now() + 1).toString(),
          type: 'message',
          text: 'I am an AI agent responding.',
          sender: 'other',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        })
      );
    }, 600);
  };

  const setActiveUserInChat = (user: any) => {
    dispatch(setActiveUser(user));
  };

  return {
    messages,
    text,
    setText,
    sendMessage,
    activeUser, // expose activeUser for chat logic
    setActiveUserInChat, // expose setter
  };
};
