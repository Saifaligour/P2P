// GroupChatScreen.js
import { useUserList } from "@/hooks/useChatList";
import { createStyle } from '@/style/ChatListStyles';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  FlatList,
  StatusBar,
  TouchableOpacity,
  View
} from 'react-native';

import { GroupListHeader } from "@/components/chatList/ChatListHeader";
import SearchBar from "@/components/chatList/SearchBar";
import { UserRow } from "@/components/chatList/UserDetails";
import { useThemeColor } from "@/hooks/useThemeColor";

const GroupChatScreen = () => {

  const { filteredUsers } = useUserList();
  const { theme, s, nextTheme, setIsDark } = useThemeColor();
  const styles = useMemo(() => createStyle(theme, s), [theme, s]);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <GroupListHeader theme={theme} s={s} />
      <SearchBar theme={theme} s={s} />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={nextTheme} style={styles.themeSwitch} activeOpacity={0.8}>
          <View style={styles.themeSwitchRow}>
            <Ionicons name="color-palette" size={20} color={theme.sentLight} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={setIsDark} style={styles.themeSwitch} activeOpacity={0.8}>
          <View style={styles.themeSwitchRow}>
            <Ionicons name="color-palette" size={20} color={theme.sentLight} />
          </View>
        </TouchableOpacity>
      </View>

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