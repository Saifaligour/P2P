import { BackButton } from '@/components/ui/BackButton';
import { useCreateUser } from '@/hooks/useCreateUser';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CreateGroupScreen() {
  const {
    groupName,
    groupDescription,
    groupDP,
    updateGroupName,
    updateGroupDescription,
    updateGroupDP,
    submitGroup,
    reset,
  } = useCreateUser();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      updateGroupDP(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    submitGroup();
    reset();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BackButton />
      <View style={styles.container}>
        <Text style={styles.label}>Group Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter group name"
          value={groupName}
          onChangeText={updateGroupName}
        />

        <Text style={styles.label}>Group Description (optional)</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Enter group description"
          value={groupDescription}
          onChangeText={updateGroupDescription}
          multiline
        />

        <Text style={styles.label}>Group Display Picture (optional)</Text>
        <TouchableOpacity style={styles.dpPicker} onPress={pickImage}>
          {groupDP ? (
            <Image source={{ uri: groupDP }} style={styles.dpImage} />
          ) : (
            <View style={styles.dpFallback}>
              <Text style={styles.dpFallbackText}>
                {groupName ? groupName.charAt(0).toUpperCase() : '+'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Create Group</Text>
        </TouchableOpacity>
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
});
