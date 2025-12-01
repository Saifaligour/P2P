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
  list: {
    paddingBottom: 24,
  },
  checkmark: { marginLeft: 4, marginTop: 1 }

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
    borderRadius: 28,
    borderWidth: 2,
    borderColor: theme.avatarBroder,
    overlayColor: theme.imageOverlay
  },
  avatarFallback: {
    width: s(56),                     // avatar size
    height: s(56),
    borderRadius: s(28),              // circular
    backgroundColor: theme.bgSecondary, // use the avatarBorder color
    justifyContent: 'center',         // center text vertically
    alignItems: 'center',             // center text horizontally
    overflow: 'hidden',               // ensure nothing overflows
    elevation: 3,                     // subtle shadow for depth (Android)
    shadowColor: theme.shadowColor,              // iOS shadow
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderColor: theme.avatarBroder,
    borderWidth: 2,
  },
  avatarName: {
    top: "5%",
    right: "3%",
    color: theme.textSecondary,      // use a subtle secondary color
    fontSize: s(32),                 // slightly larger for readability
    fontWeight: '900',               // bold enough to stand out
    fontFamily: theme.fontFamily,    // keep your theme font
    letterSpacing: 1,                // small spacing for elegance
    lineHeight: s(36),
    includeFontPadding: false,
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
    color: theme.text,
    fontSize: s(20),
    fontWeight: '600',
    fontFamily: theme.fontFamily,
  },
  last: {
    fontSize: s(16),
    lineHeight: s(21),
    fontFamily: theme.fontFamily,
    fontWeight: '400',
    letterSpacing: 0.1,
    includeFontPadding: false,
    paddingBottom: s(2),
    color: theme.text
  },
  rightColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: s(56),
  },
  time: {
    fontSize: s(11),
    fontWeight: '400',
    opacity: 0.8,
    color: theme.time
  },
  badge: {
    backgroundColor: theme.badgeColor,
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
    backgroundColor: theme.iconColor,
    borderWidth: 2,
    borderColor: theme.iconColor,
  },
  badgeText: {
    color: theme.textSecondary,
    fontSize: s(12),
    fontWeight: '700',
  },
  memberText: {
    color: theme.textSecondary,
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
    // shadowColor: theme.shadowColor,
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 18,
    marginHorizontal: 18,
  },
  textInput: {
    flex: 1,
    color: theme.inputText,
    fontSize: s(17),
    marginLeft: 12,
    fontWeight: '500',
    fontFamily: 'system',
    paddingTop: 2,
  },
});

export const headerStyle = (themes: any, s: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    zIndex: 10,
    paddingHorizontal: 12,
  },
  iconMenu: { flexDirection: 'row', gap: 16 }
})