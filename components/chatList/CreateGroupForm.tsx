import { useThemeColor } from "@/hooks/useThemeColor";
import { createGroupFormStyle } from "@/style/componentStyles";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

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
  const { theme, s } = useThemeColor();
  const styles = React.useMemo(() => createGroupFormStyle(theme, s), [theme, s]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) onChangeGroupDP(result.assets[0].uri);
  };

  return (
    <View >
      <Text style={styles.subtitle}>Group Details</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Group Name"
          placeholderTextColor={theme.inputText}
          value={groupName}
          onChangeText={onChangeGroupName}
        />
      </View>

      <View style={[styles.inputContainer, styles.textAreaContainer]}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Group Description (optional)"
          placeholderTextColor={theme.inputText}
          multiline
          value={groupDescription}
          onChangeText={onChangeGroupDescription}
        />
      </View>

      <Text style={styles.label}>Display Picture</Text>
      <TouchableOpacity style={styles.dpPicker} onPress={pickImage}>
        {groupDP ? (
          <Image source={{ uri: groupDP }} style={styles.dpImage} />
        ) : (
          <View style={styles.dpFallback}>
            <Text style={styles.dpFallbackText}>{groupName ? groupName[0].toUpperCase() : "+"}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  );
};
