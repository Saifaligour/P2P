/** @typedef {import('pear-interface')} */

/* global Pear */
import b4a from 'b4a';
import Pear from 'bare-process';
import Hyperswarm from 'hyperswarm';
import { generateHash } from './crypto.mjs';
import RPCManager from './IPC.mjs';
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
} from './rpc-commands.mjs';
import {
  closeStore,
  createGroup,
  getAllGroupDetails,
  initAutobase,
  initStore,
  readMessagesFromStore,
  writeMessagesToStore
} from './store.mjs';

const swarm = new Hyperswarm();
const { IPC } = BareKit;
const RPC = RPCManager.getInstance(IPC);
const topicPeersMap = new Map();
const groupWriterCores = new Map();

function print(args) {
  args.file = 'app.js';
  RPC.log(args);
}

Pear.on('exit', () => {
  print({ method: 'exit', message: 'Pear process exiting, cleaning up.....................' });
  swarm.destroy();
  closeStore();
});

// Enable automatic reloading for the app
// This is optional but helpful during production
// updates(() => Pear.reload())


swarm.on('connection', async (peer, info) => {
  const topics = info?.topics || [];
  const peerCount = {};
  const store = await initStore();

  for (const topicBuffer of topics) {
    const topicHex = b4a.toString(topicBuffer, 'hex');
    const groupId = topicHex;

    if (!topicPeersMap.has(topicHex)) {
      topicPeersMap.set(topicHex, new Set());
    }

    const peersSet = topicPeersMap.get(topicHex);
    peersSet.add(peer);
    peerCount[topicHex] = { current: peersSet.size, total: swarm.connections.size };

    peer.on('close', () => {
      peersSet.delete(peer);
    });

    const localWriterCore = await getWriterCoreForGroup(groupId);
    const autobase = await initAutobase(groupId);
    const allCores = autobase.inputs.concat(autobase.localInput);

    for (const core of allCores) {
      try {
        core.replicate(peer, { live: true });
        print({
          method: 'swarm.connection',
          command: 'REPLICATE',
          message: `Started replication for core ${b4a.toString(core.key, 'hex')} in group ${groupId}`
        });
      } catch (error) {
        print({
          method: 'swarm.connection',
          command: 'REPLICATE_ERROR',
          error
        });
      }
    }

    if (localWriterCore) {
      peer.write(JSON.stringify({
        type: 'writerKey',
        groupId,
        key: b4a.toString(localWriterCore.key, 'hex')
      }));
    }
  }

  peer.on('data', async (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (e) {
      print({
        method: 'peer.on(data)',
        command: 'INVALID_DATA',
        message: `Failed to parse incoming data: ${data.toString()}`
      });
      return;
    }

    if (message.type === 'writerKey') {
      const { groupId, key } = message;
      await addRemoteWriter(groupId, key);

      const remoteCore = store.get({ key: b4a.from(key, 'hex') });
      await remoteCore.ready();
      remoteCore.replicate(peer, { live: true });
      print({
        method: 'peer.on(data)',
        command: 'REMOTE_REPLICATE',
        message: `Replicating remote writer ${key} for group ${groupId}`
      });
    } else {
      print({
        method: 'peer.on(data)',
        command: 'RECEIVED_MESSAGE_FROM_PEER',
        message: 'Received data from peers',
        data: message
      });
      sendMessageToUI(message);
      writeMessagesToStore(RPC.decode(message), 'peer');
    }
  });

  peer.on('error', (error) => {
    print({
      method: 'peer.on(error)',
      command: 'PEER_ERROR',
      error
    });
  });

  print({
    method: 'swarm.on(connection)',
    command: 'NEW_PEER_CONNECTED',
    message: 'A new peer connected'
  });

  RPC.send(UPDATE_PEER_CONNECTION, peerCount);
});

swarm.on('update', () => {
  // print({ method: 'swarm.on(update)', command: 'UPDATE', message: 'Received peer update' });
});

swarm.on('network-update', (data) => {
  print({ method: 'swarm.on(network-update)', command: 'NETWORK_UPDATE', message: 'network-update)' });
});

swarm.on('network-change', (data) => {
  print({ method: 'swarm.on(network-change)', command: 'NETWORK_CHANGE', message: 'network-change' });
});

swarm.on('persistent', (data) => {
  print({ method: 'swarm.on(persistent)', command: 'PERSISTENT', message: 'persistent' });
});

RPC.onRequest(FETCH_GROUP_DETAILS, async () => {
  print({
    method: 'RPC.onRequest',
    command: 'FETCH_GROUP_DETAILS',
    message: 'Fetch group details from store'
  });
  return getAllGroupDetails();
});

RPC.onRequest(CREATE_GROUP, async (group) => {
  print({
    method: 'RPC.onRequest',
    command: 'CREATE_GROUP',
    message: 'Creating new group'
  });
  return createGroup(group);
});

RPC.onRequest(JOIN_GROUP, async ({ groupId }) => {
  const topic = generateHash(groupId);
  print({
    method: 'RPC.onRequest',
    command: 'JOIN_GROUP',
    message: `Joining chat Room: ${topic.hash}`
  });
  await joinGroup(topic.buffer);
  await getWriterCoreForGroup(topic.hash);
});

RPC.onRequest(LEAVE_GROUP, ({ groupId }) => {
  const topic = generateHash(groupId);
  print({
    method: 'RPC.onRequest',
    command: 'LEAVE_GROUP',
    message: `Leaving chat Room: ${topic.hash}`
  });
  swarm.leave(topic.buffer);
  groupWriterCores.delete(topic.hash);
});

RPC.onRequest(RECEIVE_MESSAGE, (data) => {
  print({
    method: 'RPC.onRequest',
    command: 'RECEIVE_MESSAGE',
    message: 'Sending message to peer and writing to store'
  });
  sendMsgToPeer(data);
  writeMessagesToStore(data, 'currentUser');
});

RPC.onRequest(READ_MESSAGE_FROM_STORE, (data) => {
  print({
    method: 'RPC.onRequest',
    command: 'READ_MESSAGE_FROM_STORE',
    message: `Reading messages from store for: ${JSON.stringify(data)}`
  });
  return readMessagesFromStore(data);
});

RPC.onRequest(GENERATE_HASH, ({ groupId }) => {
  print({
    method: 'RPC.onRequest',
    command: 'GENERATE_HASH',
    message: `Generating hash for groupId: ${groupId}`
  });
  return generateHash(groupId);
});

async function joinGroup(topicBuffer) {
  // Unannounce the previous topic if any
  // if (swarm.discovery) {
  //   swarm.discovery.leave()
  // }
  const discovery = swarm.join(topicBuffer, { client: true, server: true });
  await discovery.flushed();
}

async function getWriterCoreForGroup(groupId) {
  if (groupWriterCores.has(groupId)) return groupWriterCores.get(groupId);
  const store = await initStore();
  const writerCore = store.get(`writer-${groupId}`);
  await writerCore.ready();
  groupWriterCores.set(groupId, writerCore);
  return writerCore;
}

async function addRemoteWriter(groupId, remoteKeyHex) {
  const store = await initStore();
  const remoteCore = store.get({ key: b4a.from(remoteKeyHex, 'hex') });
  await remoteCore.ready();
  const base = await initAutobase(groupId);
  await base.addInput(remoteCore);
  print({
    method: 'addRemoteWriter',
    command: 'ADD_REMOTE_WRITER',
    message: `Added remote writer for group ${groupId}`
  });
}

function sendMsgToPeer(message) {
  const topicBuffer = generateHash(message[0].groupId);
  const topic = b4a.toString(topicBuffer, 'hex');

  const peers = topicPeersMap.get(topic);
  if (!peers) {
    print({
      method: 'sendMsgToPeer',
      command: 'NO_PEER_FOUND',
      message: `No peers found for topic ${message[0].groupId}`
    });
    return;
  }

  for (const peer of peers) {
    try {
      peer.write(JSON.stringify(message));
    } catch (error) {
      print({
        method: 'sendMsgToPeer',
        command: 'FAILED_TO_SEND',
        error
      });
    }
  }
}

function sendMessageToUI(message) {
  RPC.send(SEND_MESSAGE, message);
}