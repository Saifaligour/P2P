// For interactive documentation and code auto-completion in editor
/** @typedef {import('pear-interface')} */

/* global Pear */
import b4a from 'b4a'; // Module for buffer-to-string and vice-versa conversions 
import RPC from 'bare-rpc';
import Hyperswarm from 'hyperswarm'; // Module for P2P networking and connecting peers
// import { decryptWithPrivateKey, encryptWithPublicKey } from './crypto';
import { RPC_CUSTOM_INPUT, RPC_JOIN_ROOM, RPC_MESSAGE } from './rpc-commands.mjs';
// const { teardown, updates } = Pear    // Functions for cleanup and updates
import { createHash } from 'bare-crypto';
const swarm = new Hyperswarm()
const { IPC } = BareKit


try {
  if (typeof BareKit === 'undefined') {
    throw new Error('❌ BareKit is not defined in worklet');
  } else if (typeof BareKit.log !== 'function') {
    throw new Error('❌ BareKit.log is not available');
  } else {
    BareKit.log('✅ BareKit and BareKit.log are available');
  }
} catch (e) {
  console.log('[Worklet Error]', e.message);
}
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
    readMessage(message, RPC_MESSAGE)
    // print(b4a.toString(message, 'utf8'));

  })
  peer.on('error', e => print(`Connection error: ${e}`))
})

const rpc = new RPC(IPC, (req, err) => {
  if (err) {
    console.error('[Worklet] RPC Error:', err);
  } else {
    let data = parseData(req.data);
    print('[Worklet] RPC Request received:', req.command);
    if (req.command === RPC_CUSTOM_INPUT) {
      // Handle incoming chat message
      print('[Worklet] Received chat message:', data);
      data.id = Math.random().toString(36).substring(2, 15);
      data.sender = 'other';
      // Echo the message back to the client as a chat message
      writeMessage(JSON.stringify(data));
    }
    if (req.command === RPC_JOIN_ROOM) {
      // Handle joining a chat room
      const roomId = data.roomId;
      print('[Worklet] Joining chat room:', roomId)
      joinChatRoom(roomId)
    }
  }
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

function readMessage(message,command) {
  //  const payload = JSON.stringify(data);
  const messageRequest = rpc.request(command);
  messageRequest.send(message);
}

function print(...args) {
  // Use BareKit.log if available, else fallback to nothing
  if (typeof BareKit !== 'undefined' && typeof BareKit.log === 'function') {
    BareKit.log(...args);
  }
}

const parseData = (data) => {
  // Accept both Buffer and Uint8Array
  if (b4a.isBuffer(data) || data instanceof Uint8Array) {
    try {
      return JSON.parse(b4a.toString(data, 'utf-8'));
    } catch (e) {
      print('Failed to parse buffer as JSON:', e);
    }
  }
  return null
}