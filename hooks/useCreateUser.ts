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
    addGroup({
      groupName,
      groupDescription,
      groupDP,
    });
    reset();
    goBack();
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
  };
};
