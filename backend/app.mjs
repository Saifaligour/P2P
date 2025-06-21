// For interactive documentation and code auto-completion in editor
/** @typedef {import('pear-interface')} */

/* global Pear */
import Hyperswarm from 'hyperswarm'; // Module for P2P networking and connecting peers
// import { decryptWithPrivateKey, encryptWithPublicKey } from './crypto';
import { JOIN_ROOM, RECEIVE_MESSAGE, RPC_LOG, SEND_MESSAGE } from './rpc-commands.mjs';
// const { teardown, updates } = Pear    // Functions for cleanup and updates
import { createHash } from 'bare-crypto';
import RPCManager from './IPC.mjs';

const swarm = new Hyperswarm()
const { IPC } = BareKit
const RPC = RPCManager.getInstance(IPC)
// Unannounce the public key before exiting the process
// (This is not a requirement, but it helps avoid DHT pollution)
// teardown(() => swarm.destroy())

// Enable automatic reloading for the app
// This is optional but helpful during production
// updates(() => Pear.reload())

swarm.on('connection', (peer) => {
  peer.on('data', message => {
    // const base64= b4a.toString(message, 'utf8')
    // const m = decryptWithPrivateKey(base64)
    print('Received message from peer:', message)
    readMessage(message)

  })
  peer.on('error', e => print(`Connection error: ${e}`))
})

RPC.onRequest(RECEIVE_MESSAGE, (data) => {
  print(`Command :${RECEIVE_MESSAGE} P2P sending message to peer:`, data);
  writeMessage(data);
});

RPC.onRequest(JOIN_ROOM, (data) => {
  print(`Command :${JOIN_ROOM} P2P Joining chat room:`, data.roomId);
  joinChatRoom(data.roomId);
});


swarm.on('update', () => {
  // print(`Peers: ${swarm.peers.length} connections`)
})


async function joinChatRoom(roomId) {
  // Unannounce the previous topic if any
  // if (swarm.discovery) {
  //   swarm.discovery.leave()
  // }
  const topicBuffer = createHash('sha256').update(roomId).digest()
  const discovery = swarm.join(topicBuffer, { client: true, server: true })
  await discovery.flushed()

}

function writeMessage(message) {

  const peers = [...swarm.connections]
  for (const peer of peers) peer.write(message)
}

function readMessage(message) {
 RPC.send(SEND_MESSAGE,message)
}

function print(...args) {
  if (typeof BareKit !== 'undefined' && typeof BareKit.log === 'function') {
    BareKit.log(...args);
  }
  RPC.log(RPC_LOG, ...args);
}

