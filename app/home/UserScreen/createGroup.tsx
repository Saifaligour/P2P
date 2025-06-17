import { BackButton } from '@/components/ui/BackButton';
import { CreateGroupForm } from '@/components/userList/CreateGroupForm';
import { JoinGroupForm } from '@/components/userList/JoinGroupForm';
import { useCreateUser } from '@/hooks/useCreateUser';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CreateGroupScreen() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [joinGroupName, setJoinGroupName] = useState('');
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
    if (joinGroupName.trim()) {
      joinGroup(joinGroupName);
    }
    setJoinGroupName('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BackButton />
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
          <TouchableOpacity
            style={[styles.switchBtn, mode === 'create' && styles.switchBtnActive]}
            onPress={() => setMode('create')}
          >
            <Text style={[styles.switchBtnText, mode === 'create' && styles.switchBtnTextActive]}>Create Group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, mode === 'join' && styles.switchBtnActive]}
            onPress={() => setMode('join')}
          >
            <Text style={[styles.switchBtnText, mode === 'join' && styles.switchBtnTextActive]}>Join Group</Text>
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
            onScanQRCode={() => { /* TODO: scan QR code */ }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f4f7fc',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 18,
    color: '#222',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dpPicker: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 24,
  },
  dpImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  dpFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpFallbackText: {
    fontSize: 32,
    color: '#555',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 30,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  switchBtnActive: {
    backgroundColor: '#0a7ea4',
  },
  switchBtnText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
  },
  switchBtnTextActive: {
    color: '#fff',
  },
});
