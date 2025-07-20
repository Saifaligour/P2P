/** @typedef {import('pear-interface')} */

/* global Pear */
import b4a from 'b4a';
import Pear from 'bare-process';
import Hyperswarm from 'hyperswarm';
import {
  CREATE_GROUP,
  FETCH_GROUP_DETAILS,
  GENERATE_HASH,
  JOIN_GROUP,
  LEAVE_GROUP,
  READ_MESSAGE_FROM_STORE,
  RECEIVE_MESSAGE,
  SEND_MESSAGE,
  UPDATE_PEER_CONNECTION
} from '../constants/command.mjs';
import { generateHash } from './crypto.mjs';
import RPCManager from './IPC.mjs';
import StoreManager from './store.mjs';

const swarm = new Hyperswarm();
const { IPC } = BareKit;
const RPC = RPCManager.getInstance(IPC);
const topicPeersMap = new Map();
const groupWriterCores = new Map();

function print(method, command, message, dataOrError) {
  RPC.log('app.js', method, command, message, dataOrError);
}

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

  const topics = (info?.topics || []).map(buf => b4a.toString(buf, 'hex'));
  const peerCount = {};
  const store = await StoreManager.initStore();

  await Promise.all(
    topics.map(async groupId => {
      trackPeerInTopic(groupId, peer, peerCount);
      await Promise.all([
        replicateAllCoresToPeer(groupId, peer),
        sendLocalWriterKeyIfAny(groupId, peer)
      ]);
    })
  );

  attachDataHandler(peer, store);
  attachErrorHandler(peer);
  print('swarm.on(connection)', 'NEW_PEER_CONNECTED', 'A new peer connected');
  RPC.send(UPDATE_PEER_CONNECTION, peerCount);
}

function trackPeerInTopic(groupId, peer, peerCount) {
  const peersSet = topicPeersMap.get(groupId) ?? new Set();
  topicPeersMap.set(groupId, peersSet);

  peersSet.add(peer);
  peerCount[groupId] = {
    current: peersSet.size,
    total: swarm.connections.size
  };

  print('trackPeerInTopic', 'PEER_ADDED', `Peer added to group ${groupId}, total peers: ${peersSet.size}`);

  peer.once('close', () => {
    peersSet.delete(peer);
    print('trackPeerInTopic', 'PEER_DISCONNECTED', `Peer left group ${groupId}, remaining peers: ${peersSet.size}`);
  });
}

async function replicateAllCoresToPeer(groupId, peer) {
  const autobase = await StoreManager.initAutobase(groupId);
  const cores = [...autobase.inputs, autobase.localInput];

  for (const core of cores) {
    core.replicate(peer, { live: true });
    print('swarm.connection', 'REPLICATE', `Started replication for core ${b4a.toString(core.key, 'hex')} in group ${groupId}`);
  }
}

async function sendLocalWriterKeyIfAny(groupId, peer) {
  const core = await getWriterCoreForGroup(groupId);
  if (!core) {
    print('sendLocalWriterKeyIfAny', 'NO_LOCAL_WRITER', `No local writer found for group ${groupId}`);
    return;
  }
  const keyHex = b4a.toString(core.key, 'hex');
  peer.write(JSON.stringify({
    type: 'writerKey',
    groupId,
    key: keyHex
  }));
  print('sendLocalWriterKeyIfAny', 'SENT_WRITER_KEY', `Sent local writer key ${keyHex} for group ${groupId}`);
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

// ===== Writers & Replication =====
async function handleRemoteWriter({ groupId, key }, peer, store) {
  await addRemoteWriter(groupId, key);
  const remoteCore = store.get({ key: b4a.from(key, 'hex') });
  await remoteCore.ready();
  remoteCore.replicate(peer, { live: true });

  print('peer.on(data)', 'REMOTE_REPLICATE', `Replicating writer ${key} in ${groupId}`);
}

async function addRemoteWriter(groupId, remoteKeyHex) {
  try {
    const store = await StoreManager.initStore();
    const remoteCore = store.get({ key: b4a.from(remoteKeyHex, 'hex') });
    await remoteCore.ready();
    const base = await StoreManager.initAutobase(groupId);
    await base.addInput(remoteCore);
    print('addRemoteWriter', 'ADD_REMOTE_WRITER', `Added remote writer for group ${groupId}`);
  } catch (error) {
    print('addRemoteWriter', 'ADD_REMOTE_WRITER_ERROR', error);
    throw error;
  }
}

async function getWriterCoreForGroup(groupId) {
  try {
    if (groupWriterCores.has(groupId)) {
      print('getWriterCoreForGroup', 'CACHE_HIT', `Using cached writer core for group ${groupId}`);
      return groupWriterCores.get(groupId);
    }
    const store = await StoreManager.initStore();
    const writerCore = store.namespace(groupId);
    await writerCore.ready();
    groupWriterCores.set(groupId, writerCore);
    print('getWriterCoreForGroup', 'CREATED_WRITER_CORE', `Initialized writer core for group ${groupId}`);
    return writerCore;
  } catch (error) {
    print('getWriterCoreForGroup', 'GET_WRITER_CORE_ERROR', error);
    throw error;
  }
}

// ===== RPC Handlers =====
RPC.onRequest(FETCH_GROUP_DETAILS, async () => {
  try {
    print('RPC.onRequest', 'FETCH_GROUP_DETAILS', 'Fetch group details from store');
    return await StoreManager.getAllGroupDetails();
  } catch (error) {
    print('RPC.onRequest', 'FETCH_GROUP_DETAILS_ERROR', error);
    throw error;
  }
});

RPC.onRequest(CREATE_GROUP, async (group) => {
  try {
    print('RPC.onRequest', 'CREATE_GROUP', 'Creating new group');
    return await StoreManager.createGroup(group);
  } catch (error) {
    print('RPC.onRequest', 'CREATE_GROUP_ERROR', error);
    throw error;
  }
});

RPC.onRequest(JOIN_GROUP, async ({ groupId }) => {
  try {
    const topic = generateHash(groupId);
    print('RPC.onRequest', 'JOIN_GROUP', `Joining chat Room: ${topic.hash}`);
    await joinGroup(topic.buffer);
    await getWriterCoreForGroup(topic.hash);
  } catch (error) {
    print('RPC.onRequest', 'JOIN_GROUP_ERROR', error);
    throw error;
  }
});

RPC.onRequest(LEAVE_GROUP, ({ groupId }) => {
  try {
    const topic = generateHash(groupId);
    print('RPC.onRequest', 'LEAVE_GROUP', `Leaving chat Room: ${topic.hash}`);
    swarm.leave(topic.buffer);
    groupWriterCores.delete(topic.hash);
  } catch (error) {
    print('RPC.onRequest', 'LEAVE_GROUP_ERROR', error);
    throw error;
  }
});

RPC.onRequest(RECEIVE_MESSAGE, (data) => {
  try {
    print('RPC.onRequest', 'RECEIVE_MESSAGE', 'Sending message to peer and writing to store');
    sendMsgToPeer(data);
    StoreManager.writeMessagesToStore(data, 'currentUser');
  } catch (error) {
    print('RPC.onRequest', 'RECEIVE_MESSAGE_ERROR', error);
    throw error;
  }
});

RPC.onRequest(READ_MESSAGE_FROM_STORE, async (data) => {
  try {
    print('RPC.onRequest', 'READ_MESSAGE_FROM_STORE', `Reading messages from store for: ${JSON.stringify(data)}`);
    return await StoreManager.readMessagesFromStore(data);
  } catch (error) {
    print('RPC.onRequest', 'READ_MESSAGE_FROM_STORE_ERROR', error);
    throw error;
  }
});

RPC.onRequest(GENERATE_HASH, ({ groupId }) => {
  try {
    print('RPC.onRequest', 'GENERATE_HASH', `Generating hash for groupId: ${groupId}`);
    return generateHash(groupId);
  } catch (error) {
    print('RPC.onRequest', 'GENERATE_HASH_ERROR', error);
    throw error;
  }
});

// ===== Messaging =====
function sendMsgToPeer(message) {
  try {
    const topicBuffer = generateHash(message[0].groupId);
    const topic = b4a.toString(topicBuffer, 'hex');

    const peers = topicPeersMap.get(topic);
    if (!peers) {
      print('sendMsgToPeer', 'NO_PEER_FOUND', `No peers found for topic ${message[0].groupId}`);
      return;
    }

    for (const peer of peers) {
      peer.write(JSON.stringify(message));
    }
    print('sendMsgToPeer', 'SEND_SUCCESS', `Sent message to ${peers.size} peer(s) in topic ${topic}`);
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
