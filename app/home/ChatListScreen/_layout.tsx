import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
// import Themes from '@/constants/themes';
// import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  // const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // tabBarActiveTintColor: Themes[colorScheme ?? 'light'].sentLight,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="groupList"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />, // You may want to change the icon
        }}
      />
      <Tabs.Screen
        name="userList"
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />, // You may want to change the icon
        }}
      />
    </Tabs>
  );
}
