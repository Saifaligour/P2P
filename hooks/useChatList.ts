import { setActiveUser } from "@/Redux/chatReducer";
import { setSearch, setUserList } from "@/Redux/userListReducer";
import { FETCH_GROUP_DETAILS, RECEIVE_MESSAGE } from '@/constants/command.mjs';
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { rpcService } from "./RPC";
export interface User {
  id: string;
  groupId: string;
  name: string;
  message: string;
  time: string;
  avatar: string;
  isOnline: boolean;
  isRead: boolean;
  avatarType?: any;
  // Group chat fields
  members?: string[]; // user ids
  isGroup?: boolean;
  groupAdmin?: string; // user id
  createdAt?: string;
  unreadCount?: number;
}

interface RootState {
  userList: {
    search: string;
    users: User[];
  };
}

export const useUserList = () => {
  const dispatch = useDispatch();

  const search = useSelector((state: RootState) => state.userList.search);
  const users = useSelector((state: RootState) => state.userList.users);

  const filteredUsers = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return (users || []).filter((user) => user.name.toLowerCase().includes(lowerSearch));
  }, [search, users]);

  const fetchList = async () => {
    console.log(`useChatList, fetchList, Inside fetchList method`);
    const users = await rpcService.send(FETCH_GROUP_DETAILS, {}).reply();
    console.log(`useChatList, fetchList, Inside fetchList method, users`, users, users.length);
    if (users?.length)
      dispatch(setUserList(users));

  }
  useEffect(() => {
    fetchList()
  }, [])

  return {
    filteredUsers,
  };
};

export const useRow = (item) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [message, setMessage] = useState(item.message);

  const handleOpenChat = () => {
    dispatch(setActiveUser(item));
    router.push("/home/ChatScreen");
  };

  useEffect(() => {
    const unSubscribe = rpcService.subscribe(RECEIVE_MESSAGE, (data: any) => {
      if (data) {
        if (Array.isArray(data.message)) {
          if (data.message[0].groupId === item.groupId) {
            console.log('useChat, hook: RECEIVE_MESSAGE batch', data);
            setMessage(data.message[0].text);
          }
        } else {
          if (data.message.groupId === item.groupId) {
            console.log('useChat hook: RECEIVE_MESSAGE', data);
            setMessage(data.message.text);
          }
        }
      }
    });
    return () => unSubscribe();
  }, []);

  return {
    message,
    handleOpenChat
  }
};

export const useGroupListHeader = () => {
  const router = useRouter();
  const handleCreateGroup = () => {
    router.push("/home/ChatListScreen/createGroup");
  };
  const handleScanQR = () => {
    console.log('useGroupListHeader, handleScanQR method called');

  };

  return {
    handleScanQR,
    handleCreateGroup,
  };
};

export const useSearch = () => {
  const dispatch = useDispatch();
  const search = useSelector((state: RootState) => state.userList.search);

  const handleSearchChange = (text: string) => {
    dispatch(setSearch(text));
  };

  return {
    search,
    handleSearchChange,
  };
};
