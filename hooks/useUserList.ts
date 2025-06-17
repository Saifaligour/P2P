import { setSearch, setUserList } from "@/Redux/userListReducer";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

export interface User {
  id: string;
  roomId: string;
  name: string;
  message: string;
  time: string;
  avatar: string;
  isOnline: boolean;
  isRead: boolean;
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
    return users.filter((user) => user.name.toLowerCase().includes(lowerSearch));
  }, [search, users]);

  const handleOpenChat = (user: User) => {
    router.push("/home/chat");
  };

  const handleCreateGroup = () => {
    router.push("/home/UserScreen/createGroup");
  };

  const addGroup = ({ groupName, groupDescription, groupDP }) => {
    const newGroup = {
      id: Date.now().toString(),
      roomId: "room_" + Math.random().toString(36).slice(2, 10),
      name: groupName,
      message: groupDescription || '',
      time: new Date().toLocaleString(),
      avatar: groupDP || groupName.charAt(0).toUpperCase(),
      isOnline: false,
      isRead: false,
      isGroup: true,
      members: [],
      groupAdmin: '',
      createdAt: new Date().toISOString(),
    };
    dispatch(setUserList([newGroup, ...users]));
  };

  const handleSearchChange = (text: string) => {
    dispatch(setSearch(text));
  };

  return {
    search,
    filteredUsers,
    handleSearchChange,
    handleOpenChat,
    handleCreateGroup,
    addGroup,
  };
};
