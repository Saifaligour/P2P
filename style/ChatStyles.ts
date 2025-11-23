import { Platform, StyleSheet } from "react-native";

export const fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  extraBold: 'System',
};

export const createStyle = (theme: any, s: any,hasBgImage:boolean) =>  StyleSheet.create({
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
      status: {
        color: theme.sentLight,
        fontSize: s(13),
        fontWeight: '700',
        fontFamily: fonts.bold,
      },
      headerActions: {
        flexDirection: 'row',
        gap: 20,
      },
      themeSwitcher: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 100 : 110,
        right: 20,
        backgroundColor: theme.sentLight + '44',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        zIndex: 20,
      },
      themeText: {
        color: theme.sentLight,
        fontWeight: 'bold',
        fontSize: 14,
      },
      scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 130 : 110,   // Enough for header
        paddingBottom: 130,                              // Enough for input bar
        paddingHorizontal: 12,
      },
      dateBadge: {
        alignSelf: 'center',
        color: theme.sentLight,
        backgroundColor: theme.bg + 'E6',
        fontSize: s(14),
        fontWeight: '700',
        fontFamily: fonts.bold,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
      },
      messageContainer: {
        marginBottom: 12,
        maxWidth: '80%',
      },
      sentContainer: { alignSelf: 'flex-end' },
      receivedContainer: { alignSelf: 'flex-start' },
      messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      messageText: {
        fontSize: s(16.5),
        lineHeight: s(22),
      },
      messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        justifyContent: 'flex-end',
      },
      timeText: {
        fontSize: s(11),
        fontFamily: fonts.medium,
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
        shadowColor: theme.sent,
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 18,
        marginBottom: 8,
        marginTop: 10,
        marginHorizontal: 18,
      },
      textInput: {
        flex: 1,
        color: theme.text,
        fontSize: s(17),
        marginLeft: 12,
        fontWeight: '500',
        fontFamily: fonts.medium,
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
    });

// export const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f4f7fc', // main background color
//     // paddingHorizontal: 12,
//   },

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//     backgroundColor: '#f4f7fc', // match user list header color
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//     elevation: 2,
//   },
//   backButton: {
//     padding: 6,
//     marginRight: 10,
//   },
//   headerInfo: {
//     flex: 1,
//   },
//   roomName: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#075e54',
//   },
//   memberCount: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 2,
//   },
//   headerIcons: {
//     flexDirection: 'row',
//   },
//   headerIcon: {
//     marginLeft: 18,
//     padding: 6,
//   },

//   dateSeparator: {
//     alignSelf: 'center',
//     backgroundColor: '#d1d9e6',
//     paddingHorizontal: 14,
//     paddingVertical: 4,
//     borderRadius: 20,
//     marginVertical: 10,
//     opacity: 0.9,
//   },
//   dateText: {
//     fontSize: 12,
//     color: '#5a5f6a',
//   },

//   messageContainer: {
//     marginVertical: 4,
//     flexDirection: 'row',
//     maxWidth: '75%',
//   },
//   myMessageContainer: {
//     marginLeft: 'auto',
//     justifyContent: 'flex-end',
//   },
//   otherMessageContainer: {
//     marginRight: 'auto',
//     justifyContent: 'flex-start',
//   },

//   messageBubble: {
//     borderRadius: 15,
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 1 },
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   myMessageBubble: {
//     backgroundColor: '#d0e8ff', // soft light blue bubble for own messages
//     borderTopRightRadius: 0,
//   },
//   otherMessageBubble: {
//     backgroundColor: '#ffffff', // white for others
//     borderTopLeftRadius: 0,
//   },

//   messageText: {
//     fontSize: 16,
//     color: '#222',
//   },

//   messageTime: {
//     fontSize: 10,
//     color: '#777',
//     marginTop: 4,
//     alignSelf: 'flex-end',
//   },

//   systemMessageContainer: {
//     alignSelf: 'center',
//     backgroundColor: '#e3e9f3',
//     paddingVertical: 5,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     marginVertical: 12,
//     opacity: 0.7,
//   },
//   systemMessageText: {
//     fontSize: 12,
//     color: '#5a5f6a',
//     textAlign: 'center',
//   },
//   systemMessageTime: {
//     fontSize: 9,
//     color: '#8a8f9b',
//     textAlign: 'center',
//     marginTop: 2,
//   },

//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//      margin: 10,
//      borderRadius: 30,
//      borderWidth: 1.5,
//     borderColor: 'rgb(162, 176, 194)',
//     backgroundColor: '#f0f4fa',
//     borderTopWidth: 1,
//     borderTopColor: '#ddd',
//   },
//   iconButton: {
//     padding: 6,
//   },
//   textInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#222',
//     paddingHorizontal: 12,
//     backgroundColor: '#f0f4fa',
//     paddingVertical: 8,
//     maxHeight: 100,
//   },
  

// });
