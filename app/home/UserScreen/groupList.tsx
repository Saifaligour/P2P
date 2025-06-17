import React from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  View
} from "react-native";

import SearchBar from "@/components/userList/SearchBar";
import { UserRow } from "@/components/userList/UserDetails";
import { useUserList } from "@/hooks/useUserList";
import { styles } from "@/style/UserListStyles";

export default function UserListScreen() {
  const { search, filteredUsers, handleSearchChange, handleOpenChat } = useUserList();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
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
