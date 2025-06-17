import React from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  View
} from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import SearchBar from "@/components/userList/SearchBar";
import { UserRow } from "@/components/userList/UserDetails";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserList } from "@/hooks/useUserList";
import { styles } from "@/style/UserListStyles";

export default function UserListScreen() {
  const { search, filteredUsers, handleSearchChange, handleOpenChat } = useUserList();
  const colorScheme :string = useColorScheme() ?? 'light';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, { flex: 1 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ width: 32 }} />
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity onPress={() => { /* TODO: handle plus action */ }}>
              <IconSymbol name="plus" size={26} color={Colors[colorScheme].icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { /* TODO: handle scan QR action */ }}>
              <IconSymbol name="qrcode" size={26} color={Colors[colorScheme].icon} />
            </TouchableOpacity>
          </View>
        </View>
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
