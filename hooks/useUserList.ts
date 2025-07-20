import { setActiveUser } from "@/Redux/chatReducer";
import { setSearch, setUserList } from "@/Redux/userListReducer";
import { addGroupDetails } from '@/backend/Api';
import { FETCH_GROUP_DETAILS, RPC_LOG } from '@/constants/command.mjs';
import { formatLogs } from "@/utils/helpter";
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
}

interface RootState {
  userList: {
    search: string;
    users: User[];
  };
}

export const useUserList = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const search = useSelector((state: RootState) => state.userList.search);
  const users = useSelector((state: RootState) => state.userList.users);

  const filteredUsers = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return (users || []).filter((user) => user.name.toLowerCase().includes(lowerSearch));
  }, [search, users]);

  const handleOpenChat = (user: User) => {
    dispatch(setActiveUser(user));
    router.push("/home/chat");
  };

  const handleCreateGroup = () => {
    router.push("/home/UserScreen/createGroup");
  };


  const addGroup = async (groupDetails) => {
    try {
      await addGroupDetails(groupDetails); // send to server
    } catch (e) {
      // Optionally handle error (e.g., show feedback)
      console.error('Failed to add group to server:', e);
    }
    dispatch(setUserList([groupDetails, ...users]));
  };

  const handleSearchChange = (text: string) => {
    dispatch(setSearch(text));
  };

  const fetchList = async () => {
    console.log(`Inside fetchList method`);
    const users = await rpcService.send(FETCH_GROUP_DETAILS, {}).reply();
    console.log('users', users, users.length);
    if (users?.length)
      dispatch(setUserList(users));

  }
  useEffect(() => {
    rpcService.onRequest(RPC_LOG, (data: any) => formatLogs(data));

    fetchList()
  }, [])

  return {
    search,
    filteredUsers,
    handleSearchChange,
    handleOpenChat,
    handleCreateGroup,
    addGroup,
  };
};
