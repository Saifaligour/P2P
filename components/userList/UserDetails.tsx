import { User } from "@/hooks/useUserList";
import { styles } from "@/style/UserListStyles";
import React, { memo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type UserRowProps = {
  user: User;
  onPress: (user: User) => void;
};

const OnlineIndicator = () => <View style={styles.onlineDot} />;
const ReadIndicator = () => <Text style={styles.checkMark}>✓✓</Text>;
const EmptySpace = () => <View style={{ width: 18 }} />;

export const UserRow: React.FC<UserRowProps> = memo(({ user, onPress }) => (
  <TouchableOpacity
    style={styles.chatRow}
    onPress={() => onPress(user)}
    activeOpacity={0.7}
  >
    <View style={styles.avatarContainer}>
      {user.avatarType === 'name' ? (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarFallbackText}>
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
          resizeMode="cover"
        />
      )}
      {user.isOnline && <OnlineIndicator />}
    </View>

    <View style={styles.chatContent}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatName} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.chatTime}>
          {user.time}
        </Text>
      </View>

      <View style={styles.chatFooter}>
        {user.isRead ? <ReadIndicator /> : <EmptySpace />}
        <Text style={styles.chatMessage} numberOfLines={1}>
          {user.message}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
));

UserRow.displayName = "UserRow";