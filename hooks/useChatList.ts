import { setactiveChat } from "@/Redux/chatReducer";
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
  message: any;
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
      if (data && data?.message.text) {
        console.log('useChatList, useRow hook: RECEIVE_MESSAGE', data);
        dispatch(updateGroupRow(data.message));
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
    dispatch(setactiveChat(item));
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
  const handleNaviateToSettings = () => {
    router.push("/home/Settings");
  };

  return {
    handleScanQR,
    handleCreateGroup,
    handleNaviateToSettings
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
  // console.log(`useChatList, fetchList, Inside fetchList method, users`, users, users.length);
  if (users?.length) {
    sort(users)
    // console.log('user afte sort ', users);

    dispatch(setUserList(users));
  }
}

const updateGroupRow: any = (message: any) => (dispatch: any, getState: any) => {
  const { users } = getState().userList;

  // Update the correct row
  const updated = users.map((u) =>
    u.groupId === message.groupId
      ? {
        ...u,
        message,      // keep your existing fields
      }
      : u
  );

  sort(updated)
  console.log("useChatList updateGroupRow sorted row for group", message.groupId);
  dispatch(setUserList(updated));
};

function sort(list: any) {
  list.sort((a, b) => {
    const t1 = (a.message.id || a.time);
    const t2 = (b.message.id || b.time);
    return t2 - t1; // latest first
  });
}