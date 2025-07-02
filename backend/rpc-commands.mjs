const COMMANDS = {
    RPC_LOG: 1,
    FETCH_GROUP_DETAILS: 2,
    CREATE_GROUP: 3,
    JOIN_GROUP: 4,
    LEAVE_GROUP: 5,
    SEND_MESSAGE: 6,
    RECEIVE_MESSAGE: 6,
    READ_MESSAGE_FROM_STORE: 7,
    UPDATE_PEER_CONNECTION: 8,
    GENERATE_HASH: 9
};

// Dynamically export all keys
export const {
    RPC_LOG,
    FETCH_GROUP_DETAILS,
    CREATE_GROUP,
    JOIN_GROUP,
    LEAVE_GROUP,
    SEND_MESSAGE,
    RECEIVE_MESSAGE,
    READ_MESSAGE_FROM_STORE,
    UPDATE_PEER_CONNECTION,
    GENERATE_HASH
} = COMMANDS;

export function getCommand(value) {
    return Object.keys(COMMANDS).find(key => COMMANDS[key] === value);
}
