import { CreateGroupForm } from '@/components/chatList/CreateGroupForm';
import { JoinGroupForm } from '@/components/chatList/JoinGroupForm';
import { BackButton } from '@/components/ui/BackButton';
import { useCreateUser } from '@/hooks/useCreateUser';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CreateGroupScreen() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [joinGroupName, setJoinGroupName] = useState('');
  const { theme, s } = useThemeColor();
  const styles = useMemo(() => createStyles(theme, s), [theme, s]);

  const {
    groupName,
    groupDescription,
    groupDP,
    updateGroupName,
    updateGroupDescription,
    updateGroupDP,
    submitGroup,
    reset,
    joinGroup,
  } = useCreateUser();

  const handleSubmit = () => {
    submitGroup();
    reset();
  };

  const handleJoinSubmit = () => {
    if (joinGroupName.trim()) joinGroup(joinGroupName);
    setJoinGroupName('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BackButton />
      <View style={styles.container}>
        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={[styles.switchBtn, mode === 'create' && styles.switchBtnActive]}
            onPress={() => setMode('create')}
          >
            <Text style={[styles.switchBtnText, mode === 'create' && styles.switchBtnTextActive]}>
              Create Group
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, mode === 'join' && styles.switchBtnActive]}
            onPress={() => setMode('join')}
          >
            <Text style={[styles.switchBtnText, mode === 'join' && styles.switchBtnTextActive]}>
              Join Group
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'create' ? (
          <CreateGroupForm
            groupName={groupName}
            groupDescription={groupDescription}
            groupDP={groupDP}
            onChangeGroupName={updateGroupName}
            onChangeGroupDescription={updateGroupDescription}
            onChangeGroupDP={updateGroupDP}
            onSubmit={handleSubmit}
          />
        ) : (
          <JoinGroupForm
            joinGroupName={joinGroupName}
            onChangeGroupName={setJoinGroupName}
            onSubmit={handleJoinSubmit}
            onScanQRCode={() => { }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, s: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bg },
    container: { flex: 1, padding: s(24) },
    switchContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: s(24) },
    switchBtn: {
      flex: 1,
      paddingHorizontal: s(20),
      paddingVertical: s(16),
      backgroundColor: theme.bgSecondary,
      borderRadius: s(30),
      marginHorizontal: s(4),
      alignItems: 'center',
    },
    switchBtnActive: { backgroundColor: theme.sent },
    switchBtnText: { color: theme.text, fontSize: s(16), fontWeight: '600' },
    switchBtnTextActive: { color: theme.sentText },
  });
