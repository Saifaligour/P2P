import { RECEIVE_MESSAGE } from "@/constants/command.mjs";
import { rpcService } from "@/hooks/RPC";
import { User } from "@/hooks/useChatList";
import { createGroupStyle } from "@/style/ChatListStyles";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type UserRowProps = {
  item: User;
  onPress: (user: User) => void;
  theme: any,
  s: (size: number) => number;
};

export const UserRow: React.FC<UserRowProps> = memo(({ item, onPress, theme, s }) => {
  const [message, setMessage] = useState(item.message);

  // Separate function for message subscription
  const subscribeToMessages = (user, setMessage) => {
    rpcService.subscribe(RECEIVE_MESSAGE, (data: any) => {
      if (data) {
        if (Array.isArray(data.message)) {
          if (data.message[0].groupId === user.groupId) {
            setMessage(data.message[0].text);
          }
        } else {
          if (data.message.groupId === user.groupId) {
            setMessage(data.message.text);
          }
        }
      }
    });
  };

  useEffect(() => {
    subscribeToMessages(item, setMessage);
  }, [item]);

  const styles = useMemo(() => createGroupStyle(theme, s), [theme, s]);
  console.log(item);
  // const OnlineIndicator = () => <View style={styles.onlineDot} />;
  const ReadIndicator = () => <Text style={styles.checkMark}>✓✓</Text>;
  const EmptySpace = () => <View style={{ width: 18 }} />;
  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.container} activeOpacity={0.7}>
      {item.avatarType === "name" ? (
        <View style={styles.avatarFallback}>
          <Text> {item.name ? item.name.charAt(0).toUpperCase() : "?"}</Text>
        </View>
      ) : (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      )}
      {/* {!item.isOnline && <OnlineIndicator />} */}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.isRead ? <ReadIndicator /> : <EmptySpace />}
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.last}>{message}</Text>
        </View>
      </View>
      <View style={styles.rightColumn}>
        <Text style={styles.time}>
          {item.time}
        </Text>
        {item.unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        ) : (
          <Text style={styles.memberText}>{item.unreadCount}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

UserRow.displayName = "UserRow";

