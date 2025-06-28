// For interactive documentation and code auto-completion in editor
/** @typedef {import('pear-interface')} */

/* global Pear */
import Hyperswarm from 'hyperswarm'; // Module for P2P networking and connecting peers
// import { decryptWithPrivateKey, encryptWithPublicKey } from './crypto';
import b4a from 'b4a';
import Pear from 'bare-process'; // or global `Pear` (if auto-injected)
import { generateHash } from './crypto.mjs';
import RPCManager from './IPC.mjs';
import { CREATE_GROUP, FETCH_GROUP_DETAILS, JOIN_GROUP, LEAVE_GROUP, READ_MESSAGE_FROM_STORE, RECEIVE_MESSAGE, SEND_MESSAGE, UPDATE_PEER_CONNECTION } from './rpc-commands.mjs';
import { closeStore, createGroup, getAllGroupDetails, readMessagesFromStore, writeMessagesToStore } from './store.mjs';
const swarm = new Hyperswarm()
const { IPC } = BareKit
const RPC = RPCManager.getInstance(IPC)
const topicPeersMap = new Map() // topicHex => Set of peers

function print(...args) {
  RPC.log('[app.js]', ...args);
}
// Unannounce the public key before exiting the process
// (This is not a requirement, but it helps avoid DHT pollution)

Pear.on('exit', () => {
  console.log('------------- Pear on exit ----------------');
  swarm.destroy()
  closeStore()
})

// Enable automatic reloading for the app
// This is optional but helpful during production
// updates(() => Pear.reload())


swarm.on('connection', (peer, info) => {
  const topics = info?.topics || []
  for (const topicBuffer of topics) {
    const topicHex = b4a.toString(topicBuffer, 'hex')
    if (!topicPeersMap.has(topicHex)) {
      topicPeersMap.set(topicHex, new Set())
    }
    topicPeersMap.get(topicHex).add(peer)

    peer.on('close', () => {
      topicPeersMap.get(topicHex)?.delete(peer)
    })
  }

  peer.on('data', message => {
    // const base64= b4a.toString(message, 'utf8')
    // const m = decryptWithPrivateKey(base64)
    print('Received message from peer:', message)
    sendMessageToUI(message);
    writeMessagesToStore(message, 'peer')

  })

  peer.on('error', e => print(`Connection error: ${e}`))
})

swarm.on('update', () => {
  const peer = [];
  for (const e of topicPeersMap.keys()) {
    const current = topicPeersMap.get(e).size
    const total = swarm.connections.size;
    peer.push([e, { current, total }])
    print(`Peers: connections  total :${total}, current: ${current}`)
  }

  RPC.send(UPDATE_PEER_CONNECTION, peer)
})

swarm.on('network-update', (data) => {
  print('network-update', data)
})
swarm.on('network-change', (data) => {
  print('network-change', data)

})
swarm.on('persistent', (data) => {
  print('persistent', data)

})

RPC.onRequest(FETCH_GROUP_DETAILS, async () => {
  print(`[Command:FETCH_GROUP_DETAILS] Fetch group details from store`);
  // Sending back to UI 
  return getAllGroupDetails()
});

RPC.onRequest(CREATE_GROUP, async (group) => {
  print(`[Command:CREATE_GROUP] Creating new group`);
  // Sending back to UI
  return createGroup(group)
});

RPC.onRequest(JOIN_GROUP, ({ groupId }) => {
  const topic = generateHash(groupId)
  print(`[Command:JOIN_GROUP] Joining chat Room: ${top.hex}`);
  joinGroup(topic.buffer);
});

RPC.onRequest(LEAVE_GROUP, ({ groupId }) => {
  const topic = generateHash(groupId)
  print(`[Command:LEAVE_GROUP] Leaving chat Room: ${topic.hex}`);
  swarm.leave(topic.buffer)
});

RPC.onRequest(RECEIVE_MESSAGE, (data) => {
  print(`[Command:RECEIVE_MESSAGE] sending message to peer and writing in store`);
  sendMsgToPeer(data);
  writeMessagesToStore(data, 'currentUser')

});

RPC.onRequest(READ_MESSAGE_FROM_STORE, (data) => {
  print(`[Command:READ_MESSAGE_FROM_STORE] sending message to peer:`, data);
  return readMessagesFromStore(data)
});



async function joinGroup(topicBuffer) {
  // Unannounce the previous topic if any
  // if (swarm.discovery) {
  //   swarm.discovery.leave()
  // }
  const discovery = swarm.join(topicBuffer, { client: true, server: true })
  await discovery.flushed()

}

function sendMsgToPeer(message) {
  const topicBuffer = generateHash(message[0].groupId);
  const topic = b4a.toString(topicBuffer, 'hex')

  const peers = topicPeersMap.get(topic)
  if (!peers) {
    print(`No peers found for topic ${message[0].groupId}`)
    return
  }

  for (const peer of peers) {
    try {
      peer.write(JSON.stringify(message))
    } catch (err) {
      console.error('Failed to send message to peer:', err)
    }
  }
}

function sendMessageToUI(message) {
  RPC.send(SEND_MESSAGE, message)
}



