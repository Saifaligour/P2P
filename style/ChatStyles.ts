import { Platform, StyleSheet } from "react-native";

export const createStyle = (theme: any, s: any, hasBgImage: boolean) => StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.imageOverlay || 'transparent',
  },
  safeArea: {
    flex: 1,
    backgroundColor: hasBgImage ? 'transparent' : theme.bg,
  },
  header: {
    position: 'fixed',
    top: Platform.OS === 'ios' ? 0 : 60,
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
    shadowColor: theme.shadowColor,          // iOS shadow
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
  name: {
    color: theme.text,
    fontSize: s(20),
    fontWeight: '600',
    fontFamily: theme.fontFamily,
  },
  status: {
    color: theme.iconColor,
    fontSize: s(13),
    fontWeight: '700',
    fontFamily: theme.fontFamily,
  },

  scrollContent: {
    // paddingBottom: 130,
    paddingHorizontal: 12,
  },

  dateBadge: {
    alignSelf: 'center',
    color: theme.badgeColor,
    backgroundColor: theme.bg + 'E6',
    fontSize: s(14),
    fontWeight: '700',
    fontFamily: theme.fontFamily,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },

  messageContainer: {
    marginBottom: s(10),
  },

  sentContainer: {
    alignSelf: 'flex-end',
  },

  receivedContainer: {
    alignSelf: 'flex-start',
  },

  messageBubble: {
    paddingHorizontal: s(14),
    paddingTop: s(6),
    paddingBottom: s(10),   // extra bottom padding so time fits nicely
    borderRadius: s(18),
    maxWidth: '82%',        // WhatsApp bubble width
    position: 'relative',
    elevation: 1,

  },

  timeText: {
    fontSize: s(11),
    fontWeight: '400',
    opacity: 0.8,
    marginLeft: s(4),
  },

  messageText: {
    fontSize: s(16),
    lineHeight: s(21),
    fontFamily: theme.fontFamily,
    fontWeight: '400',
    letterSpacing: 0.1,
    includeFontPadding: false,
    paddingBottom: s(2),
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'flex-end',
  },

  inputContainer: {
    // position: 'fixed',
    // bottom: 20
    // left: 6,
    // right: 6,
    backgroundColor: theme.inputBg,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.inputBorder,
    shadowColor: theme.inputBorder,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 18,
    marginBottom: 8,
    marginTop: 10,
    marginHorizontal: 18,
  },
  textInput: {
    flex: 1,
    color: theme.inputText,
    fontSize: s(17),
    marginLeft: 12,
    fontWeight: '500',
    fontFamily: theme.fontFamily,
    paddingTop: 2,
  },
  sendButton: {
    backgroundColor: theme.sent,
    width: s(54),
    height: s(54),
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputActions: {
    flexDirection: 'row',
    gap: 16,
  },
  checkmark: { marginLeft: 4, marginTop: 1 }
});


