import { setSearch } from "@/Redux/userListReducer"; // Adjust the import path as necessary
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

export interface User {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar: string;
  isOnline: boolean;
  isRead: boolean;
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

  const handleSearchChange = (text: string) => {
    dispatch(setSearch(text));
  };

  return {
    search,
    filteredUsers,
    handleSearchChange,
    handleOpenChat,
  };
};
