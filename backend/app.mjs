// For interactive documentation and code auto-completion in editor
/** @typedef {import('pear-interface')} */

/* global Pear */
import Hyperswarm from 'hyperswarm'; // Module for P2P networking and connecting peers
// import { decryptWithPrivateKey, encryptWithPublicKey } from './crypto';
import { JOIN_ROOM, LEAVE_ROOM, RECEIVE_MESSAGE, RPC_LOG, SEND_MESSAGE } from './rpc-commands.mjs';
// const { teardown, updates } = Pear    // Functions for cleanup and updates
import b4a from 'b4a';
import { createHash } from 'bare-crypto';
import RPCManager from './IPC.mjs';

const swarm = new Hyperswarm()
const { IPC } = BareKit
const RPC = RPCManager.getInstance(IPC)
const topicPeersMap = new Map() // topicHex => Set of peers

// Unannounce the public key before exiting the process
// (This is not a requirement, but it helps avoid DHT pollution)
// teardown(() => swarm.destroy())

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
    readMessage(message)

  })
  peer.on('error', e => print(`Connection error: ${e}`))
})

swarm.on('update', () => {
  print(`Peers: connections ${swarm.connections.size}`)
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

RPC.onRequest(RECEIVE_MESSAGE, (data) => {
  print(`Command :${RECEIVE_MESSAGE} P2P sending message to peer:`, data);
  writeMessage(data);
});

RPC.onRequest(JOIN_ROOM, (roomId) => {
  const topicBuffer = createHash('sha256').update(roomId).digest()
  const topic = RPC.decode(topicBuffer, 'hex')
  print(`Command :${JOIN_ROOM} P2P Joining chat Room: ${roomId},${topic}`);
  joinChatRoom(topicBuffer);
});

RPC.onRequest(LEAVE_ROOM, (roomId) => {
  const topicBuffer = createHash('sha256').update(roomId).digest()
  const topic = RPC.decode(topicBuffer, 'hex')
  print(`Command :${JOIN_ROOM} P2P Joining chat Room: ${roomId},${topic}`);
  swarm.leave(topicBuffer)
});



async function joinChatRoom(topicBuffer) {
  // Unannounce the previous topic if any
  // if (swarm.discovery) {
  //   swarm.discovery.leave()
  // }
  const discovery = swarm.join(topicBuffer, { client: true, server: true })
  await discovery.flushed()

}

function writeMessage(message) {
  const peers = topicPeersMap.get(message.roomId)
  if (!peers) {
    print(`No peers found for topic ${message.roomId}`)
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

function readMessage(message) {
  RPC.send(SEND_MESSAGE, message)
}

function print(...args) {
  if (typeof BareKit !== 'undefined' && typeof BareKit.log === 'function') {
    BareKit.log(...args);
  }
  const fileName = import.meta.url;
  RPC.log(RPC_LOG, fileName, ...args);
}

