/** @typedef {import('pear-interface')} */

/* global Pear */
import b4a from 'b4a';
import Pear from 'bare-process';
import Hyperswarm from 'hyperswarm';
import {
  GENERATE_HASH,
  JOIN_GROUP,
  LEAVE_GROUP,
  READ_MESSAGE_FROM_STORE,
  RECEIVE_MESSAGE,
  SEND_MESSAGE,
  UPDATE_PEER_CONNECTION
} from '../constants/command.mjs';
import { BOOTSTRAP_NODES as bootstrap } from '../constants/index.mjs';
import { generateHash } from './crypto.mjs';
import RPCManager from './IPC.mjs';
import StoreManager from './store.mjs';


const RPC = RPCManager.getInstance();

function print(method, command, message, dataOrError) {
  RPC.log('app.js', method, command, message, dataOrError);
}

const keyPair = await StoreManager.loadOrCreateKeyPair();
const swarm = new Hyperswarm({ bootstrap, keyPair });
// ===== Lifecycle =====
Pear.on('exit', () => {
  print('exit', null, 'Pear process exiting, cleaning up.....................');
  try {
    swarm.destroy();
    StoreManager.closeStore();
  } catch (error) {
    print('exit', 'CLEANUP_ERROR', error);
  }
});

// ===== Swarm Connection =====
swarm.on('connection', async (peer, info) => {
  try {
    await handleNewPeerConnection(peer, info);
  } catch (error) {
    print('swarm.on(connection)', 'CONNECTION_ERROR', error);
  }
});

async function handleNewPeerConnection(peer, info) {
  print('swarm.connection', 'ON_CONNECT', 'New peer joined the group');
  const store = await StoreManager.initStore();
  attachDataHandler(peer, store);
  attachErrorHandler(peer);
  print('swarm.on(connection)', 'NEW_PEER_CONNECTED', 'A new peer connected');
  RPC.send(UPDATE_PEER_CONNECTION, swarm.connections.size);
}

function attachDataHandler(peer, store) {
  peer.on('data', async raw => {
    try {
      print('peer.on(data)', 'RECEIVED_DATA', 'Data from peer', raw);
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'writerKey') {
        await handleRemoteWriter(msg, peer, store);
      } else {
        print('peer.on(data)', 'RECEIVED_MESSAGE', 'Data from peer', msg);
        sendMessageToUI(msg);
        await StoreManager.writeMessagesToStore(RPC.decode(msg), 'peer');
      }
    } catch (err) {
      print('peer.on(data)', 'DATA_ERROR', `Couldn’t process: ${raw}`, null, err);
    }
  });
}

function attachErrorHandler(peer) {
  peer.on('error', err => {
    print('peer.on(error)', 'PEER_ERROR', err);
  });
}

// ===== Messaging =====
function sendMsgToPeer(message) {
  try {
    const topicBuffer = generateHash(message[0].groupId);
    const topic = b4a.toString(topicBuffer, 'hex');
    print('sendMsgToPeer', 'SEND_MESSAGE', `Sending message to topic: ${topic}`);
    for (const peer of swarm.peers) {
      peer.write(JSON.stringify(message));
    }
    print('sendMsgToPeer', 'SEND_SUCCESS', `Sent message to ${swarm.connections.size} peer(s) in topic ${topic}`);
  } catch (error) {
    print('sendMsgToPeer', 'SEND_MESSAGE_ERROR', error);
  }
}

function sendMessageToUI(message) {
  try {
    RPC.send(SEND_MESSAGE, message);
  } catch (error) {
    print('sendMessageToUI', 'SEND_UI_MESSAGE_ERROR', error);
  }
}

async function joinGroup(topicBuffer) {
  try {
    const discovery = swarm.join(topicBuffer, { client: true, server: true });
    await discovery.flushed();
    print('joinGroup', 'JOIN_SUCCESS', `Successfully joined topic ${b4a.toString(topicBuffer, 'hex')}`);
  } catch (error) {
    print('joinGroup', 'JOIN_GROUP_ERROR', error);
    throw error;
  }
}

// ===== RPC Handlers =====

async function handleCreateGroup(group) {
  try {
    print('RPC.onRequest', 'CREATE_GROUP', 'Creating new group');
    return await StoreManager.createGroup(group);
  } catch (error) {
    print('RPC.onRequest', 'CREATE_GROUP_ERROR', error);
    throw error;
  }
}

async function handleJoinGroup({ groupId }) {
  try {
    const topic = generateHash(groupId);
    print('RPC.onRequest', 'JOIN_GROUP', `Joining chat Room: ${topic.hash}`);
    await joinGroup(topic.buffer);
  } catch (error) {
    print('RPC.onRequest', 'JOIN_GROUP_ERROR', error);
    throw error;
  }
}

function handleLeaveGroup({ groupId }) {
  try {
    const topic = generateHash(groupId);
    print('RPC.onRequest', 'LEAVE_GROUP', `Leaving chat Room: ${topic.hash}`);
    swarm.leave(topic.buffer);
  } catch (error) {
    print('RPC.onRequest', 'LEAVE_GROUP_ERROR', error);
    throw error;
  }
}

function handleReceiveMessage(data) {
  try {
    print('RPC.onRequest', 'RECEIVE_MESSAGE', 'Sending message to peer and writing to store');
    sendMsgToPeer(data);
    StoreManager.writeMessagesToStore(data, 'currentUser');
  } catch (error) {
    print('RPC.onRequest', 'RECEIVE_MESSAGE_ERROR', error);
    throw error;
  }
}

async function handleReadMessageFromStore(data) {
  try {
    print('RPC.onRequest', 'READ_MESSAGE_FROM_STORE', `Reading messages from store for: ${JSON.stringify(data)}`);
    return await StoreManager.readMessagesFromStore(data);
  } catch (error) {
    print('RPC.onRequest', 'READ_MESSAGE_FROM_STORE_ERROR', error);
    throw error;
  }
}

function handleGenerateHash({ groupId }) {
  try {
    print('RPC.onRequest', 'GENERATE_HASH', `Generating hash for groupId: ${groupId}`);
    return generateHash(groupId);
  } catch (error) {
    print('RPC.onRequest', 'GENERATE_HASH_ERROR', error);
    throw error;
  }
}

// ===== Register Handlers =====
RPC.onRequest(JOIN_GROUP, handleJoinGroup);
RPC.onRequest(LEAVE_GROUP, handleLeaveGroup);
RPC.onRequest(RECEIVE_MESSAGE, handleReceiveMessage);
RPC.onRequest(READ_MESSAGE_FROM_STORE, handleReadMessageFromStore);
RPC.onRequest(GENERATE_HASH, handleGenerateHash);
