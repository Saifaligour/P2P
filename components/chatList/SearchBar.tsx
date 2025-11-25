import { useSearch } from "@/hooks/useChatList";
import { searchGroupStyle } from "@/style/ChatListStyles";
import React, { useMemo } from "react";
import { TextInput, View } from "react-native";

interface SearchBarProps {
  theme: any;
  s: (size: number) => number;
}

export default function SearchBar({ theme, s }: SearchBarProps) {
  const styles = useMemo(() => searchGroupStyle(theme, s), [theme, s]);
  const { handleSearchChange, search } = useSearch()
  return (
    <View style={styles.inputContainer} pointerEvents="box-none">
      <TextInput
        placeholder="Search..."
        placeholderTextColor={theme.sentLight + '88'}
        value={search}
        onChangeText={handleSearchChange}
        style={styles.textInput}
        clearButtonMode="while-editing"
      />
    </View>
  );
}
