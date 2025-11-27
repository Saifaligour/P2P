import { setActiveUser } from "@/Redux/chatReducer";
import { setSearch, setUserList } from "@/Redux/userListReducer";
import { FETCH_GROUP_DETAILS, RECEIVE_MESSAGE } from '@/constants/command.mjs';
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
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

  useEffect(() => {

    dispatch(fetchList())
    const unSubscribe = rpcService.subscribe(RECEIVE_MESSAGE, (data: any) => {
      if (data) {
        if (Array.isArray(data.message)) {
          console.log('useChatList, useRow, hook: RECEIVE_MESSAGE batch', data);
          dispatch(updateGroupRow(data.message[0]));
        } else {
          console.log('useChatList, useRow hook: RECEIVE_MESSAGE', data);
          dispatch(updateGroupRow(data.message));
        }
      }
    });
    return () => unSubscribe();
  }, []);
  return {
    filteredUsers,
  };
};

export const useRow = (item) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const handleOpenChat = () => {
    dispatch(setActiveUser(item));
    router.push("/home/ChatScreen");
  };

  return {
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


const fetchList: any = () => async (dispatch: any) => {
  console.log(`useChatList, fetchList, Inside fetchList method called`);
  const users = await rpcService.send(FETCH_GROUP_DETAILS, {}).reply();
  console.log(`useChatList, fetchList, Inside fetchList method, users`, users, users.length);
  if (users?.length)
    dispatch(setUserList(users));
}

const updateGroupRow: any = (msg: any) => (dispatch: any, getState: any) => {
  const { users } = getState().userList;

  // Update the correct row
  const updated = users.map((u) =>
    u.groupId === msg.groupId
      ? {
        ...u,
        message: msg.text,      // keep your existing fields
        time: msg.timestamp,    // keep your existing fields
      }
      : u
  );

  // Auto-sort groups: latest time at top
  updated.sort((a, b) => {
    const t1 = new Date(a.time).getTime();
    const t2 = new Date(b.time).getTime();
    return t2 - t1; // latest first
  });

  console.log("useChatList updateGroupRow sorted row for group", msg.groupId);
  dispatch(setUserList(updated));
};
