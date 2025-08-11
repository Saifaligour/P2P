

export const APP_NAME = 'P2P';
export const ENVIRONMENT = 'dev';
export const IS_PROD = ENVIRONMENT === 'prod';
export const USER_STORE = 'USER_STORE';
export const USER_INFO = 'USER_INFO';
export const GROUP_INFO = 'GROUP_INFO';
export const GROUP_STORE = 'GROUP_STORE';
export const MESSAGE_STORE = 'MESSAGE_STORE';
export const PEER_CONNECTION_STORE = 'PEER_CONNECTION_STORE';
export const GROUP_DETAILS_STORE = 'GROUP_DETAILS_STORE';
const PORT = 58710
export const BOOTSTRAP_NODES = [
    '88.99.3.86@node1.hyperdht.org:49737', '142.93.90.113@node2.hyperdht.org:49737', '138.68.147.8@node3.hyperdht.org:49737',
    `127.0.0.1:${PORT}`, `192.168.1.4:${PORT}`, `192.168.1.255:${PORT}`, `192.168.1.1:${PORT}`
]; // disable public bootstrap nodes

export const KEY_EXCCHANGE = 'KEY_EXCCHANGE';
