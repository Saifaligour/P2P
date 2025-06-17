import { fetchGroupDetails } from '@/backend/Api';
import {
  resetCreateUser,
  setGroupDescription,
  setGroupDP,
  setGroupName,
} from '@/Redux/createUserReducer';
import { RootState } from '@/Redux/store';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useUserList } from './useUserList';

export const useCreateUser = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { groupName, groupDescription, groupDP } = useSelector((state: RootState) => state.createUser);
  const { addGroup } = useUserList();

  const updateGroupName = (name: string) => dispatch(setGroupName(name));
  const updateGroupDescription = (desc: string) => dispatch(setGroupDescription(desc));
  const updateGroupDP = (dp: string | null) => dispatch(setGroupDP(dp));
  const reset = () => dispatch(resetCreateUser());

  const goBack = () => {
    router.back();
  };

  const submitGroup = () => {
     const isAvatarImage = !!groupDP;
        const newGroup = {
          id: Date.now().toString(),
          roomId: "room_" + Math.random().toString(36).slice(2, 10),
          name: groupName,
          message: groupDescription || '',
          time: new Date().toLocaleString(),
          avatar: groupDP || groupName.charAt(0).toUpperCase(),
          avatarType: isAvatarImage ? 'image' : 'name',
          isOnline: false,
          isRead: false,
          isGroup: true,
          members: [],
          groupAdmin: '',
          createdAt: new Date().toISOString(),
        }
    addGroup(newGroup);
    reset();
    goBack();
  };

  const joinGroup = async (roomId: string) => {
    try {
      const group = await fetchGroupDetails(roomId);
      if (group) {
        addGroup(group);
        goBack();
      }
    } catch (error) {
      // Optionally handle error (e.g., show feedback)
      console.error('Failed to join group:', error);
    }
  };

  return {
    groupName,
    groupDescription,
    groupDP,
    updateGroupName,
    updateGroupDescription,
    updateGroupDP,
    reset,
    submitGroup,
    joinGroup,
  };
};
