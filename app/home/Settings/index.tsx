import { useHeader } from '@/hooks/useSettings';
import { useThemeColor } from '@/hooks/useThemeColor';
import { createSettingsStyle } from '@/style/SettingsStyles';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useMemo } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const Header = memo(({ styles, theme, s, nextTheme, setIsDark }: any) => {
    const { userDetails, goBack }: any = useHeader();

    return (
        <View style={styles.header} pointerEvents="box-none">
            {/* Back Button */}
            <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={s(32)} color={theme.iconColor} />
            </TouchableOpacity>

            {/* Left Profile Section */}
            <View style={styles.headerInfo}>
                <Image
                    source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                    style={styles.avatar}
                />
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.name}>
                        {userDetails?.credentials?.username}
                    </Text>
                    <Text style={styles.status}>Online</Text>
                </View>
            </View>

            {/* Right Actions */}
            <View style={styles.headerActions}>

                <TouchableOpacity onPress={nextTheme} style={styles.themeSwitch} activeOpacity={0.8}>
                    <Ionicons name="color-palette" size={24} color={theme.iconColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={setIsDark} style={styles.themeSwitch} activeOpacity={0.8}>
                    <Ionicons name="color-palette" size={24} color={theme.iconColor} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={s(24)} color={theme.iconColor} />
                </TouchableOpacity>

            </View>
        </View>
    );
});
Header.displayName = 'SettingsHeader';

// ---------------- Setting Row ----------------
const SettingItem = memo(({ item, styles, s, theme }: any) => {
    return (
        <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={item?.onPress}
        >
            <View style={styles.rowLeft}>
                <View style={styles.iconWrapper}>
                    <Ionicons name={item.icon} size={s(24)} color={theme.iconColor} />
                </View>
                <Text style={styles.rowText}>{item.title}</Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={s(22)}
                color={theme.iconColor + 'AA'}
            />
        </TouchableOpacity>
    );
});
SettingItem.displayName = 'SettingItem';

// ---------------- Main Screen ----------------
const SettingsScreen = () => {
    const { theme, s, nextTheme, setIsDark } = useThemeColor();
    const styles = useMemo(() => createSettingsStyle(theme, s), [theme, s]);

    const DATA = [
        { id: '1', title: 'Account', icon: 'person-outline' },
        { id: '2', title: 'Privacy', icon: 'lock-closed-outline' },
        { id: '3', title: 'Notifications', icon: 'notifications-outline' },
        { id: '4', title: 'Appearance', icon: 'color-palette-outline' },
        { id: '5', title: 'Chat Backup', icon: 'cloud-upload-outline' },
        { id: '6', title: 'Data Usage', icon: 'analytics-outline' },
        { id: '7', title: 'Blocked Users', icon: 'remove-circle-outline' },
        { id: '8', title: 'About', icon: 'information-circle-outline' },
    ];

    return (
        <SafeAreaView style={styles.container}>

            <Header styles={styles} theme={theme} s={s} nextTheme={nextTheme} setIsDark={setIsDark} />

            <FlatList
                data={DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SettingItem item={item} styles={styles} s={s} theme={theme} />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
            />
        </SafeAreaView>
    );
};

export default SettingsScreen;
