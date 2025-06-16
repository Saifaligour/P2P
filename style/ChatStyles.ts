import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(69, 90, 127)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f2f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerInfo: {
    marginLeft: 5,
    flex: 1,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#075e54',
  },
  memberCount: {
    fontSize: 12,
    color: 'gray',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 5,
  },
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginVertical: 10,
  },
  dateText: {
    color: 'gray',
    fontSize: 12,
  },
  messageContainer: {
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  myMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  messageTime: {
    fontSize: 11,
    color: 'gray',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 13,
    color: 'gray',
    textAlign: 'center',
  },
  systemMessageTime: {
    fontSize: 11,
    color: 'darkgray',
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
  borderColor: 'rgb(32, 48, 69)', // or any highlight blue
  backgroundColor: 'rgb(109, 127, 170)', // dark input background
},

textInput: {
  flex: 1,
  fontSize: 16,
  color: '#fff',
  paddingHorizontal: 12,
  paddingVertical: 8,
  maxHeight: 120,
},

iconButton: {
  padding: 6,
},
  

});
