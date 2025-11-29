
import { User, useRow } from "@/hooks/useChatList";
import { createGroupStyle } from "@/style/ChatListStyles";
import React, { memo, useMemo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type UserRowProps = {
  item: User;
  theme: any,
  s: (size: number) => number;
};

export const UserRow: React.FC<UserRowProps> = memo(({ item, theme, s }) => {
  const { handleOpenChat } = useRow(item)

  const styles = useMemo(() => createGroupStyle(theme, s), [theme, s]);
  console.log('UserDetails, UserRow, item', item);
  // const OnlineIndicator = () => <View style={styles.onlineDot} />;
  const ReadIndicator = () => <Text style={styles.checkMark}>✓✓</Text>;
  const EmptySpace = () => <View style={{ width: 18 }} />;
  return (
    <>
      <TouchableOpacity onPress={handleOpenChat} style={styles.container} activeOpacity={0.7}>
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
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.last}>{item?.message?.text}</Text>
          </View>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.time}>
            {item?.message?.timestamp || item.time}
          </Text>
          {item.unreadCount > 0 &&
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          }
        </View>
      </TouchableOpacity>
      <View style={styles.border} ></View>
    </>
  );
});

UserRow.displayName = "UserRow";

