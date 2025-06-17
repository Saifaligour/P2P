// store/userListReducer.ts
import { User } from "@/hooks/useUserList";

 const SET_SEARCH = "SET_SEARCH";
 const SET_USER_LIST = "SET_USER_LIST";


const initialState = {
  search: "",
  users: [
    {
        id: "11",
        roomId: "room_123131431234" ,
        name: "Eleanor Pena",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
        isOnline: true,
        isRead: true,
    },
] as User[],
};

export function setSearch(search: string): { type: string; payload: string } {
  return { type: SET_SEARCH, payload: search };
}

export const setUserList = (users: any[]) => ({
  type: SET_USER_LIST,
  payload: users,
});

export default function userListReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_SEARCH:
      return { ...state, search: action.payload };
    case SET_USER_LIST:
      return { ...state, users: action.payload };
    default:
      return state;
  }
}
