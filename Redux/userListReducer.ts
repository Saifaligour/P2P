// store/userListReducer.ts
import { User } from "@/hooks/useUserList";

 const SET_SEARCH = "SET_SEARCH";
 const SET_USER_LIST = "SET_USER_LIST";


const initialState = {
  search: "",
  users: [{
        id: "1",
        name: "Darlene Robertson",
        message: "Amet minim mollit non deserunt...",
        time: "2:30 PM",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        isOnline: true,
        isRead: false,
    },
    {
        id: "2",
        name: "Brooklyn Simmons",
        message: "Amet minim mollit non deserunt...",
        time: "1:00 AM",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        isOnline: true,
        isRead: true,
    },
    {
        id: "3",
        name: "Robert Fox",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/men/34.jpg",
        isOnline: true,
        isRead: false,
    },
    {
        id: "4",
        name: "Eleanor Pena",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
        isOnline: true,
        isRead: true,
    },
    {
        id: "5",
        name: "Eleanor Pena",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
        isOnline: true,
        isRead: true,
    },
    {
        id: "6",
        name: "Eleanor Pena",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
        isOnline: true,
        isRead: true,
    },
    {
        id: "7",
        name: "Eleanor Pena",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
        isOnline: true,
        isRead: true,
    },
    {
        id: "8",
        name: "Eleanor Pena",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
        isOnline: true,
        isRead: true,
    },
    {
        id: "9",
        name: "Eleanor Pena",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
        isOnline: true,
        isRead: true,
    },
    {
        id: "10",
        name: "Eleanor Pena",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
        isOnline: true,
        isRead: true,
    },
    {
        id: "11",
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
