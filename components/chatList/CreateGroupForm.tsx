import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateGroupFormProps {
  groupName: string;
  groupDescription: string;
  groupDP: string | null;
  onChangeGroupName: (name: string) => void;
  onChangeGroupDescription: (desc: string) => void;
  onChangeGroupDP: (uri: string | null) => void;
  onSubmit: () => void;
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  groupName,
  groupDescription,
  groupDP,
  onChangeGroupName,
  onChangeGroupDescription,
  onChangeGroupDP,
  onSubmit,
}) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      onChangeGroupDP(result.assets[0].uri);
    }
  };

  return (
    <>
      <Text style={styles.label}>Group Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        value={groupName}
        onChangeText={onChangeGroupName}
      />

      <Text style={styles.label}>Group Description (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Enter group description"
        value={groupDescription}
        onChangeText={onChangeGroupDescription}
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
      <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
        <Text style={styles.submitBtnText}>Create Group</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
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
