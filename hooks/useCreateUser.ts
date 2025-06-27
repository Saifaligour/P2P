import { fetchGroupDetails } from '@/backend/Api';
import { CREATE_GROUP, RPC_LOG } from '@/backend/rpc-commands.mjs';
import { rpcService } from '@/hooks/RPC';
import {
  resetCreateUser,
  setGroupDescription,
  setGroupDP,
  setGroupName,
} from '@/Redux/createUserReducer';
import store, { RootState } from '@/Redux/store';
import { setUserList } from '@/Redux/userListReducer';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useCreateUser = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { groupName, groupDescription, groupDP } = useSelector((state: RootState) => state.createUser);

  const updateGroupName = (name: string) => dispatch(setGroupName(name));
  const updateGroupDescription = (desc: string) => dispatch(setGroupDescription(desc));
  const updateGroupDP = (dp: string | null) => dispatch(setGroupDP(dp));
  const reset = () => dispatch(resetCreateUser());

  const goBack = () => {
    router.back();
  };

  const addGroup = (groupDetails: any) => {
    const users = store.getState()?.userList?.users;
    dispatch(setUserList([groupDetails, ...users]));
  };

  const submitGroup = async () => {
    const isAvatarImage = !!groupDP;
    const newGroup = {
      id: Date.now().toString(),
      groupId: groupName,
      name: groupName,
      message: groupDescription || '',
      descirption: groupDescription,
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
    rpcService.send(CREATE_GROUP, newGroup)

  };

  const joinGroup = async (groupId: string) => {
    try {
      const group = await fetchGroupDetails(groupId);
      if (group) {
        addGroup(group);
        goBack();
      }
    } catch (error) {
      // Optionally handle error (e.g., show feedback)
      console.error('Failed to join group:', error);
    }
  };
  useEffect(() => {
    rpcService.onRequest(RPC_LOG, (data: any) => console.log(data));

  }, [])
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
