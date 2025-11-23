import { IconSymbol } from "@/components/ui/IconSymbol";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";

export const GroupListHeader = ({ onPlus, onScanQR, theme, s }: { onPlus: () => void; onScanQR: () => void; theme: any; s: any }) => {
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
        <TouchableOpacity onPress={onPlus}>
          <IconSymbol name="plus" size={26} color={theme.sentLight} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onScanQR}>
          <IconSymbol name="qrcode" size={26} color={theme.sentLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
