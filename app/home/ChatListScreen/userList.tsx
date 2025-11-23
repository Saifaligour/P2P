// GroupChatScreen.js
import { useUserList } from "@/hooks/useChatList";
import { createStyle } from '@/style/ChatListStyles';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { GroupListHeader } from "@/components/chatList/ChatListHeader";
import SearchBar from "@/components/chatList/SearchBar";
import { UserRow } from "@/components/chatList/UserDetails";
import themes from "@/constants/themes";
import { useThemeColor } from "@/hooks/useThemeColor";

const GroupChatScreen = () => {

  const { search, filteredUsers, handleSearchChange, handleOpenChat, handleCreateGroup } = useUserList();
  const { theme, s, selectedTheme, nextTheme } = useThemeColor();
  const styles = useMemo(() => createStyle(theme, s), [theme, s]);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <GroupListHeader
        onPlus={handleCreateGroup}
        onScanQR={() => { /* TODO: handle scan QR action */ }}
        theme={theme}
        s={s}
      />
      <SearchBar value={search} onChange={handleSearchChange} theme={theme} s={s} />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={nextTheme} style={styles.themeSwitch} activeOpacity={0.8}>
          <View style={styles.themeSwitchRow}>
            <Ionicons name="color-palette" size={20} color={theme.sentLight} />
            <Text style={styles.themeText}>{themes[selectedTheme].name}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <UserRow item={item} onPress={handleOpenChat} theme={theme} s={s} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default GroupChatScreen;