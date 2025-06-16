import { styles } from "@/style/UserListStyles";
import React from "react";
import { TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <View style={styles.searchWrapper}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChange}
        clearButtonMode="while-editing"
      />
    </View>
  );
}
