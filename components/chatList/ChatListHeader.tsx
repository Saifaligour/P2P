import { IconSymbol } from "@/components/ui/IconSymbol";
import { useGroupListHeader } from "@/hooks/useChatList";
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width, height } = Dimensions.get('window');

export const GroupListHeader = ({ theme, s }: { theme: any; s: any }) => {
  const { handleCreateGroup, handleScanQR, handleNaviateToSettings } = useGroupListHeader();
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [
    { label: "New Group", action: handleCreateGroup },
    { label: "Read All", action: () => alert("Marked all as read") },
    { label: "Settings", action: handleNaviateToSettings },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      paddingTop: Platform.OS === 'ios' ? 0 : 40,
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
        <TouchableOpacity onPress={() => setMenuVisible(prev => !prev)}>
          <Ionicons name="ellipsis-vertical" size={26} color={theme.sentLight} />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <DropdownMenu
          items={menuItems}
          theme={theme}
          s={s}
          onHide={() => setMenuVisible(false)}
        />
      )}
    </View>
  );
};

// ----------------- Dropdown Menu -----------------
interface MenuItem {
  label: string;
  action: () => void;
}

interface DropdownMenuProps {
  items: MenuItem[];
  theme: any;
  s: any;
  onHide: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, theme, s, onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleItemPress = (action: () => void) => {
    action();
    closeMenu();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -10, duration: 200, useNativeDriver: true }),
    ]).start(onHide);
  };

  return (
    <View style={overlayStyle.container}>
      {/* Catch all touches outside */}
      <TouchableWithoutFeedback onPress={closeMenu}>
        <View style={overlayStyle.fullScreen} />
      </TouchableWithoutFeedback>

      <Animated.View style={[createDropdownStyles(theme, s).container, { opacity, transform: [{ translateY }] }]}>
        {items.map((item, idx) => (
          <TouchableOpacity key={idx} style={createDropdownStyles(theme, s).item} onPress={() => handleItemPress(item.action)}>
            <Text style={createDropdownStyles(theme, s).itemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

// ----------------- Dropdown Styles -----------------
const createDropdownStyles = (theme: any, s: any) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 80, // adjust below header
      right: 12,
      backgroundColor: theme.bgCard || theme.inputBg,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: theme.inputBorder + '55',
      shadowColor: theme.text,
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 6,
      overflow: 'hidden',
      zIndex: 100,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    item: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 0.3,
      borderBottomColor: theme.inputBorder + '55',
    },
    itemText: {
      fontSize: 15,
      color: theme.text,
      fontWeight: '600',
    },
  });

const overlayStyle = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    zIndex: 99,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'transparent',
  },
});
