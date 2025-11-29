import { StyleSheet } from 'react-native';
import { fonts } from './ChatStyles';

export const createSettingsStyle = (theme: any, s: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.bg,
        },

        header: {
            position: 'fixed',
            // top: Platform.OS === 'ios' ? 15 : 10,
            flexDirection: 'row',
            alignItems: 'center',
            // zIndex: 10,
            paddingHorizontal: 8,
            // paddingVertical: 4,
        },
        headerInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginLeft: 16,
        },
        headerActions: {
            flexDirection: 'row',
            gap: 20,
        },
        avatar: {
            width: s(48),
            height: s(48),
            borderRadius: 24,
            borderWidth: 3,
            borderColor: theme.sentLight,
        },
        name: {
            color: theme.text,
            fontSize: s(20),
            fontWeight: '800',
            fontFamily: fonts.extraBold,
        },
        profileWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 18,
            borderRadius: 20,
            marginHorizontal: 14,
            backgroundColor: theme.inputBg,
            borderWidth: 1,
            borderColor: theme.inputBorder,
            marginBottom: 10,
            shadowColor: theme.sent,
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
        },
        profileImage: {
            width: s(58),
            height: s(58),
            borderRadius: 29,
            borderWidth: 3,
            borderColor: theme.sentLight,
        },
        profileName: {
            fontSize: s(20),
            fontWeight: '700',
            color: theme.text,
        },
        profileStatus: {
            fontSize: s(13),
            color: theme.sentLight,
            marginTop: 2,
        },

        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 18,
            backgroundColor: theme.inputBg,
            borderRadius: 20,
            marginHorizontal: 14,
            marginVertical: 6,
            borderWidth: 1,
            borderColor: theme.inputBorder,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
        },
        rowLeft: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        iconWrapper: {
            width: s(38),
            height: s(38),
            borderRadius: 19,
            backgroundColor: theme.sent + '22',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        rowText: {
            fontSize: s(18),
            fontWeight: '600',
            color: theme.text,
            fontFamily: fonts.medium,
        },
    });
