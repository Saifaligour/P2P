import Hyperswarm from 'hyperswarm'
// import { BOOTSTRAP_NODES, PORT } from './config.js'
import { USER_STORE } from '../../constants/index.mjs'
import { wait } from './helper.mjs'
export default class NetworkManager {
  constructor(base, store, RPC, options = {}) {
    this.base = base
    this.store = store
    this.RPC = RPC
    this.verbose = options.verbose || false
    this.connectedPeers = 0
    this.onPeerCountChange = options.onPeerCountChange || (() => { })
    this.swarm = new Hyperswarm({
      // keyPair: options.keyPair,
      // bootstrap: BOOTSTRAP_NODES,
      // port: PORT
    })
    this.log('constructor', 'Hyperswarm initialized');
    this.peerHandler()
    this.onConnect()
  }

  onConnect() {
    this.swarm.on('connection', async (c) => {
      const store = await this.store.getStore(USER_STORE);
      store.replicate(c)
      this.log('onConnect', 'New peer connected (swarm remotePublicKey):', c.remotePublicKey.toString('hex'))
      this.log('onConnect', 'New peer connected (swarm publicKey):', c.publicKey.toString('hex'))
      // Listen for the peer's autobase key exchange
      c.on('data', (data) => {
        this.handlePeerMessage(data, c)
      })

    })
  }

  peerHandler() {
    this.swarm._discovery.watch((groupId, topic) => {
      this.log('peerHandler', 'New topic:', groupId, 'Connection Size:', topic.swarm.connections.size)

      for (const peer of topic.swarm.connections) {
        const base = this.base.get(groupId)
        if (base) {
          const writerKey = base.local.key.toString('hex')
          this.sendKeyExchange(groupId, writerKey, peer)
          base.replicate(peer)
        }
        this.log('peerHandler', 'Existing Peer Connection', base)
      }

      topic.swarm.connections.watch((peer) => {
        const base = this.base.get(groupId)
        if (base) {
          const writerKey = base.local.key.toString('hex')
          this.sendKeyExchange(groupId, writerKey, peer)
          base.replicate(peer)
        }
        this.log('peerHandler', 'New Peer Connection')
        this.log('peerHandler', 'Existing', groupId, 'Connection Size:', topic.swarm.connections.size)
      })

    });

  }


  handlePeerMessage(data, connection) {
    try {
      const message = JSON.parse(data.toString())
      this.log('handlePeerMessage', 'message', message);
      if (message.type === 'exchange-key' && message.writerKey) {
        const key = connection.remotePublicKey.toString('hex')
        // this.announceMyGroups(key, [message.localKey])
        // this.indexMyGroups(key, [message.localKey])
        this.handleKeyExchange(message)
      }
    } catch (err) {
      // Not a JSON message, ignore
    }
  }

  async handleKeyExchange(userDetails) {
    if (this.verbose) this.log('handleKeyExchange', 'Received peer autobase key:', userDetails.groupId)
    await wait(300)
    this.log('handleKeyExchange', 'Has groupId:', this.base.has(userDetails.groupId));

    if (!this.base.has(userDetails.groupId)) return;
    // Only add if we're writable and peer isn't already a writer
    if (this.base.get(userDetails.groupId).writable) {
      const currentWriters = this.getCurrentWriters(userDetails.groupId)
      if (this.verbose) {
        this.log('handleKeyExchange', 'Current writers:', currentWriters.map(k => k.slice(0, 8) + '...'))
      }

      if (!currentWriters.includes(userDetails.writerKey)) {
        if (this.verbose) {
          this.log('handleKeyExchange', 'Auto-adding peer autobase key as writer:', userDetails.writerKey)
        }
        try {
          await this.base.get(userDetails.groupId).append(JSON.stringify({ add: userDetails.writerKey }))
          this.store.addWriterToGroup(userDetails)
          if (this.verbose) {
            this.log('handleKeyExchange', 'Successfully sent add writer command for:', userDetails.writerKey)
          }
        } catch (err) {
          console.error('Failed to add writer:', err)
        }
      } else {
        if (this.verbose) this.log('handleKeyExchange', 'Peer already a writer:', userDetails.wieterKey)
      }

    }
  }

  getCurrentWriters(groupId) {
    return this.base.get(groupId).linearizer.indexers.map(w => {
      if (!w) return null
      if (w.key) return w.key.toString('hex')
      if (w.core && w.core.key) return w.core.key.toString('hex')
      return null
    }).filter(Boolean)
  }

  sendKeyExchange(groupId, writerKey, connection) {
    try {
      const keyExchange = JSON.stringify({
        type: 'exchange-key',
        writerKey,
        groupId,
      })
      connection.write(keyExchange)
      if (this.verbose) this.log('sendKeyExchange', 'Sent our autobase key to peer', keyExchange)
    } catch (error) {
      console.error('Failed to send key exchange:', error)
    }
  }

  async join(discoveryKey) {
    const DISK = this.swarm.join(discoveryKey)
    await DISK.flushed()
    if (this.verbose) {
      this.log('join', 'Joining swarm with discovery key:', discoveryKey.toString('hex'))
    }
    return DISK
  }

  destroy() {
    return this.swarm.destroy()
  }

  log(method, message, data = null, command = null) {
    this.RPC.log('network.mjs', method, command, message, data);
  }

}
