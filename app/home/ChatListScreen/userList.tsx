// GroupChatScreen.js
import { useUserList } from "@/hooks/useChatList";
import { createStyle } from '@/style/ChatListStyles';
import React, { useMemo } from 'react';
import {
  FlatList,
  StatusBar,
  View
} from 'react-native';

import { GroupListHeader } from "@/components/chatList/ChatListHeader";
import SearchBar from "@/components/chatList/SearchBar";
import { UserRow } from "@/components/chatList/UserDetails";
import { useThemeColor } from "@/hooks/useThemeColor";

const GroupChatScreen = () => {
  const { filteredUsers } = useUserList();
  const { theme, s } = useThemeColor();
  const styles = useMemo(() => createStyle(theme, s), [theme, s]);


  return (
    <View style={styles.safeArea}>
      <StatusBar />
      <GroupListHeader theme={theme} s={s} />
      <SearchBar theme={theme} s={s} />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <UserRow item={item} theme={theme} s={s} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default GroupChatScreen;