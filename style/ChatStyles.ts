import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fc', // main background color
    paddingHorizontal: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 2,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#075e54',
  },
  memberCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 18,
    padding: 6,
  },

  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: '#d1d9e6',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginVertical: 10,
    opacity: 0.9,
  },
  dateText: {
    fontSize: 12,
    color: '#5a5f6a',
  },

  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
    maxWidth: '75%',
  },
  myMessageContainer: {
    marginLeft: 'auto',
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    marginRight: 'auto',
    justifyContent: 'flex-start',
  },

  messageBubble: {
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  myMessageBubble: {
    backgroundColor: '#d0e8ff', // soft light blue bubble for own messages
    borderTopRightRadius: 0,
  },
  otherMessageBubble: {
    backgroundColor: '#ffffff', // white for others
    borderTopLeftRadius: 0,
  },

  messageText: {
    fontSize: 16,
    color: '#222',
  },

  messageTime: {
    fontSize: 10,
    color: '#777',
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: '#e3e9f3',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 12,
    opacity: 0.7,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#5a5f6a',
    textAlign: 'center',
  },
  systemMessageTime: {
    fontSize: 9,
    color: '#8a8f9b',
    textAlign: 'center',
    marginTop: 2,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
     margin: 10,
     borderRadius: 30,
     borderWidth: 1.5,
    borderColor: 'rgb(162, 176, 194)',
    backgroundColor: '#f0f4fa',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  iconButton: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingHorizontal: 12,
    backgroundColor: '#f0f4fa',
    paddingVertical: 8,
    maxHeight: 100,
  },
  

});
