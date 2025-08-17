import { CREATE_GROUP, JOIN_GROUP, RPC_LOG } from '@/constants/command.mjs';
import { rpcService } from '@/hooks/RPC';
import {
  resetCreateUser,
  setGroupDescription,
  setGroupDP,
  setGroupName,
} from '@/Redux/createUserReducer';
import store, { RootState } from '@/Redux/store';
import { setUserList } from '@/Redux/userListReducer';
import { formatLogs } from '@/utils/helpter';
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
      isAdmin: true,
      createdAt: new Date().toISOString(),
    }

    reset();
    goBack();
    const res = await rpcService.send(CREATE_GROUP, newGroup).reply();
    addGroup(res);
  };

  const joinGroup = async (invite) => {
    if (invite) {
      const res = await rpcService.send(JOIN_GROUP, { invite }).reply();
      if (res?.data) {
        addGroup(res.data)
        goBack();
      }
    }
  }

  useEffect(() => {
    rpcService.onRequest(RPC_LOG, (data: any) => formatLogs(data));

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
    joinGroup
  };
};
