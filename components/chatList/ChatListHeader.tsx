import { IconSymbol } from "@/components/ui/IconSymbol";
import { useGroupListHeader } from "@/hooks/useChatList";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";

export const GroupListHeader = ({ theme, s }: { theme: any; s: any }) => {
  const { handleCreateGroup, handleScanQR, } = useGroupListHeader()
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      paddingTop: Platform.OS === 'ios' ? 0 : 40, // Add top padding for status bar
      zIndex: 10,
      paddingHorizontal: 12,
    }}>
      <View style={{ width: 32 }} />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <TouchableOpacity onPress={handleCreateGroup}>
          <IconSymbol name="plus" size={26} color={theme.sentLight} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleScanQR}>
          <IconSymbol name="qrcode" size={26} color={theme.sentLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
