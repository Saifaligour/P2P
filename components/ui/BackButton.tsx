import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const BackButton = ({ color = '#0a7ea4', size = 26, style }: { color?: string; size?: number; style?: any }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={[styles.backButton, style]} onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginTop: 10,
    marginLeft: 10,
    alignSelf: 'flex-start',
    padding: 6,
    borderRadius: 20,
  },
});
