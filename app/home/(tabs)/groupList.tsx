import { useRouter, } from "expo-router";
import React, { useState } from "react";

import {
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const dummyChats = [
    {
        id: "1",
        name: "Darlene Robertson",
        message: "Amet minim mollit non deserunt...",
        time: "2:30 PM",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        isOnline: true,
        isRead: false,
    },
    {
        id: "2",
        name: "Brooklyn Simmons",
        message: "Amet minim mollit non deserunt...",
        time: "1:00 AM",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        isOnline: true,
        isRead: true,
    },
    {
        id: "3",
        name: "Robert Fox",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/men/34.jpg",
        isOnline: true,
        isRead: false,
    },
    {
        id: "4",
        name: "Eleanor Pena",
        message: "Amet minim mollit non deserunt...",
        time: "Yesterday",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
        isOnline: true,
        isRead: true,
    },
];

export default function UserListScreen() {
    const router = useRouter();

    const [search, setSearch] = useState("");

    const filteredChats = dummyChats.filter((chat) =>
        chat.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenChat = (chat: any) => {
        router.push('/home/chat');
    };


    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.chatRow} onPress={handleOpenChat}>
            <View style={styles.avatarContainer} >
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {item.isOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <View style={styles.chatFooter}>
                    {item.isRead ? (
                        <Text style={styles.checkMark}>✓✓</Text>
                    ) : (
                        <View style={{ width: 18 }} />
                    )}
                    <Text style={styles.chatMessage} numberOfLines={1}>
                        {item.message}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <Text style={styles.title}>Inbox</Text>

                <View style={styles.searchWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => (
                        <View style={styles.separator} />
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f4f7fc",
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        marginTop: 10,
        marginBottom: 10,
        color: "#222",
    },
    searchWrapper: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 10,
        elevation: 1,
    },
    searchInput: {
        fontSize: 16,
        color: "#000",
    },
    chatRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 12,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    onlineDot: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#34C759",
        borderWidth: 2,
        borderColor: "#fff",
    },
    chatContent: {
        flex: 1,
        justifyContent: "center",
    },
    chatHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    chatName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111",
    },
    chatTime: {
        fontSize: 13,
        color: "#999",
    },
    chatFooter: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    checkMark: {
        fontSize: 13,
        color: "#007AFF",
        marginRight: 6,
    },
    chatMessage: {
        fontSize: 14,
        color: "#555",
        flexShrink: 1,
    },
    separator: {
        height: 10,
    },
});
