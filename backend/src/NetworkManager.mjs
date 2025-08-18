import Hyperswarm from 'hyperswarm'
// import { BOOTSTRAP_NODES, PORT } from './config.js'

export default class NetworkManager {
  constructor(base, db, options = {}) {
    this.base = base
    this.db = db
    this.verbose = options.verbose || false
    this.connectedPeers = 0
    this.onPeerCountChange = options.onPeerCountChange || (() => { })
    this.swarm = new Hyperswarm({
      // keyPair: options.keyPair,
      // bootstrap: BOOTSTRAP_NODES,
      // port: PORT
    })
    console.log('Hyperswarm initialized');
    this.peerHandler()
    this.onConnect()
  }

  onConnect() {
    this.swarm.on('connection', (c) => {
      this.db.replicate(c)
      console.log('New peer connected (swarm remotePublicKey):', c.remotePublicKey.toString('hex'))
      console.log('New peer connected (swarm publicKey):', c.publicKey.toString('hex'))
      // Listen for the peer's autobase key exchange
      c.on('data', (data) => {
        this.handlePeerMessage(data, c)
      })

    })
  }

  peerHandler() {
    this.swarm._discovery.watch((groupId, topic) => {
      console.log('New topic: ', groupId, 'Connection Size:', topic.swarm.connections.size)    //   for (const peer of peers) peer.write(JSON.stringify({ message: 'hi' }))

      for (const peer of topic.swarm.connections) {
        const base = this.base.get(groupId)
        if (base) {
          const writerKey = base.local.key.toString('hex')
          this.sendKeyExchange(groupId, writerKey, peer)
          base.replicate(peer)
        }
        console.log('Existing Peer Connection', base)
      }

      topic.swarm.connections.watch((peer) => {
        const base = this.base.get(groupId)
        if (base) {
          const writerKey = base.local.key.toString('hex')
          this.sendKeyExchange(groupId, writerKey, peer)
          base.replicate(peer)
        }
        console.log('New Peer Connection',)
        console.log('Existing', groupId, 'Connection Size:', topic.swarm.connections.size)    //   for (const peer of peers) peer.write(JSON.stringify({ message: 'hi' }))
      })

    });

  }


  handlePeerMessage(data, connection) {
    try {
      const message = JSON.parse(data.toString())
      console.log('message', message);
      if (message.type === 'exchange-key' && message.localKey) {
        const key = connection.remotePublicKey.toString('hex')
        // this.announceMyGroups(key, [message.localKey])
        // this.indexMyGroups(key, [message.localKey])
        this.handleKeyExchange(message.groupId, message.localKey)
      }
    } catch (err) {
      // Not a JSON message, ignore
    }
  }

  async handleKeyExchange(groupId, peerAutobaseKey) {
    if (this.verbose) console.log('Received peer autobase key:', peerAutobaseKey)
    if (!this.base.has(groupId)) return;
    // Only add if we're writable and peer isn't already a writer
    if (this.base.get(groupId).writable) {
      setTimeout(async () => {
        const currentWriters = this.getCurrentWriters(groupId)

        if (this.verbose) {
          console.log('Current writers:', currentWriters.map(k => k.slice(0, 8) + '...'))
        }

        if (!currentWriters.includes(peerAutobaseKey)) {
          if (this.verbose) {
            console.log('Auto-adding peer autobase key as writer:', peerAutobaseKey)
          }
          try {
            await this.base.get(groupId).append(JSON.stringify({ add: peerAutobaseKey }))
            if (this.verbose) {
              console.log('Successfully sent add writer command for:', peerAutobaseKey)
            }
          } catch (err) {
            console.error('Failed to add writer:', err)
          }
        } else {
          if (this.verbose) console.log('Peer already a writer:', peerAutobaseKey)
        }
      }, 1000)
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

  sendKeyExchange(groupId, key, connection) {
    try {
      const keyExchange = JSON.stringify({
        type: 'exchange-key',
        localKey: key,
        groupId,
      })
      connection.write(keyExchange)
      if (this.verbose) console.log('Sent our autobase key to peer', keyExchange)
    } catch (error) {
      console.error('Failed to send key exchange:', error)
    }
  }

  async join(discoveryKey) {
    const DISK = this.swarm.join(discoveryKey)
    await DISK.flushed()
    if (this.verbose) {
      console.log('Joining swarm with discovery key:', discoveryKey.toString('hex'))
    }
    return DISK
  }

  destroy() {
    return this.swarm.destroy()
  }

}
