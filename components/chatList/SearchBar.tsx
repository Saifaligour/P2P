import { searchGroupStyle } from "@/style/ChatListStyles";
import React, { useMemo } from "react";
import { TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  theme: any;
  s: (size: number) => number;
}

export default function SearchBar({ value, onChange, theme, s }: SearchBarProps) {
  const styles = useMemo(() => searchGroupStyle(theme, s), [theme, s]);

  return (
    <View style={styles.inputContainer} pointerEvents="box-none">
      <TextInput
        placeholder="Search..."
        placeholderTextColor={theme.sentLight + '88'}
        value={value}
        onChangeText={onChange}
        style={styles.textInput}
        clearButtonMode="while-editing"
      />
    </View>
  );
}
