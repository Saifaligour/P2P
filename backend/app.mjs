// For interactive documentation and code auto-completion in editor
/** @typedef {import('pear-interface')} */

/* global Pear */
import b4a from 'b4a'; // Module for buffer-to-string and vice-versa conversions 
import Hyperswarm from 'hyperswarm'; // Module for P2P networking and connecting peers
// import { decryptWithPrivateKey, encryptWithPublicKey } from './crypto';
import { JOIN_ROOM, RECEIVE_MESSAGE, SEND_MESSAGE } from './rpc-commands.mjs';
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

// When there's a new connection, listen for new messages, and add them to the UI
swarm.on('connection', (peer) => {
  // name incoming peers after first 6 chars of its public key as hex
  peer.on('data', message => {
    // const m = decryptData(b4a.toString(message, 'utf8'))
    // const base64= b4a.toString(message, 'utf8')
    // const m = decryptWithPrivateKey(base64)
    readMessage(message)
    // print(b4a.toString(message, 'utf8'));

  })
  peer.on('error', e => print(`Connection error: ${e}`))
})

RPC.onRequest(RECEIVE_MESSAGE, (data) => {
  print('[Worklet] Received chat message:', data);
  writeMessage(JSON.stringify(data));
});

RPC.onRequest(JOIN_ROOM, (data) => {
  print('[Worklet] Joining chat room:', data.roomId);
  joinChatRoom(data.roomId);
});


// When there's updates to the swarm, update the peers count
swarm.on('update', () => {
  print(`Peers: ${swarm.peers.length} connections`)
})


async function joinChatRoom(roomId) {
  // Join a chat room by its ID
  print('[Worklet] Joining chat room:', roomId)

  // Unannounce the previous topic if any
  // if (swarm.discovery) {
  //   swarm.discovery.leave()
  // }

  // Create a new topic buffer from the room ID
  const topicBuffer = createHash('sha256').update(roomId).digest()
  const discovery = swarm.join(topicBuffer, { client: true, server: true })
  await discovery.flushed()

}

function writeMessage(message) {

  const encoded = b4a.from(message); // or b4a.from(message)
  const peers = [...swarm.connections]
  for (const peer of peers) peer.write(encoded)
}

function readMessage(message) {
 RPC.send(SEND_MESSAGE,message)
}

function print(...args) {
  // Use BareKit.log if available, else fallback to nothing
  if (typeof BareKit !== 'undefined' && typeof BareKit.log === 'function') {
    BareKit.log(...args);
  }
}

