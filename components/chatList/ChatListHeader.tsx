import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";

export const GroupListHeader = ({ onPlus, onScanQR }: { onPlus: () => void; onScanQR: () => void }) => {
  const colorScheme: string = useColorScheme() ?? 'light';
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      paddingTop: Platform.OS === 'ios' ? 0 : 40, // Add top padding for status bar
      zIndex: 10,
    }}>
      <View style={{ width: 32 }} />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <TouchableOpacity onPress={onPlus}>
          <IconSymbol name="plus" size={26} color={Colors[colorScheme].icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onScanQR}>
          <IconSymbol name="qrcode" size={26} color={Colors[colorScheme].icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
