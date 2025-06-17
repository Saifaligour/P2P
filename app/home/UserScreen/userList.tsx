import React from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  View
} from "react-native";

import { GroupListHeader } from "@/components/userList/GroupListHeader";
import SearchBar from "@/components/userList/SearchBar";
import { UserRow } from "@/components/userList/UserDetails";
import { useUserList } from "@/hooks/useUserList";
import { styles } from "@/style/UserListStyles";

export default function UserListScreen() {
  const { search, filteredUsers, handleSearchChange, handleOpenChat, handleCreateGroup } = useUserList();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, { flex: 1 }]}> 
        <GroupListHeader 
          onPlus={handleCreateGroup}
          onScanQR={() => { /* TODO: handle scan QR action */ }} 
        />
        <SearchBar value={search} onChange={handleSearchChange} />
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserRow user={item} onPress={handleOpenChat} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
}
