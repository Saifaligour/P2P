import { Platform, StyleSheet } from "react-native";

export const createStyle = (theme: any, s: any) => StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: theme.bg,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: s(28),
    fontWeight: '800',
    color: theme.text,
  },
  themeSwitch: {
    backgroundColor: theme.sentLight + '44',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  themeText: {
    color: theme.sentLight,
    fontWeight: '700',
  },
  list: {
    paddingBottom: 24,
  },
  themeSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

})

export const createGroupStyle = (theme: any, s: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(12),
  },
  avatar: {
    width: s(56),
    height: s(56),
    borderRadius: s(28),
    borderWidth: 2,
    borderColor: theme.sent,
  },
  avatarFallback: {
    width: s(56),
    height: s(56),
    borderRadius: s(28),
    borderWidth: 2,
    backgroundColor: theme.received,
    borderColor: theme.sent,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontSize: s(16),
    color: theme.sent,
    marginRight: 6,
  },
  info: {
    flex: 1,
    marginLeft: s(12),
  },
  name: {
    fontSize: s(16),
    fontWeight: '700',
    color: theme.text,
  },
  last: {
    fontSize: s(13),
    color: theme.muted,
    marginTop: s(4),
  },
  rightColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: s(56),
  },
  time: {
    color: theme.muted,
    fontSize: s(12),
  },
  badge: {
    backgroundColor: theme.sent,
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    borderRadius: s(12),
    minWidth: s(28),
    alignItems: 'center',
    marginTop: s(4),
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.sent,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: '#fff',
    fontSize: s(12),
    fontWeight: '700',
  },
  memberText: {
    color: theme.muted,
    fontSize: s(12),
    marginTop: s(4),
  },
});

export const searchGroupStyle = (theme: any, s: any) => StyleSheet.create({
  inputContainer: {
    // position: 'absolute',
    // top: Platform.OS === 'ios' ? 10 : 10,
    // left: 6,
    // right: 6,
    backgroundColor: theme.inputBg,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.30,
    borderColor: theme.inputBorder,
    // shadowColor: theme.sent,
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 18,
    marginHorizontal: 18,
  },
  textInput: {
    flex: 1,
    color: theme.text,
    fontSize: s(17),
    marginLeft: 12,
    fontWeight: '500',
    fontFamily: 'system',
    paddingTop: 2,
  },
});