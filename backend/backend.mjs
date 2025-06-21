import b4a from 'b4a';
import { createHash } from 'bare-crypto';
import RPC from 'bare-rpc';
import Hyperswarm from 'hyperswarm';
import { RPC_JOIN_ROOM, RPC_MESSAGE } from './rpc-commands.mjs';

const swarm = new Hyperswarm();
const { IPC } = BareKit;

function print(...args) {
  if (typeof BareKit?.log === 'function') BareKit.log(...args);
}

swarm.on('connection', (peer, info) => {
  print('[Worklet] Peer connected');
  peer.on('data', (data) => {
    print('[Worklet] Received:', b4a.toString(data));
    const req = rpc.request(RPC_MESSAGE);
    req.send(data);
  });
});

const rpc = new RPC(IPC, (req, err) => {
  if (err) return print('[Worklet] RPC Error:', err);

  const data = b4a.isBuffer(req.data) ? b4a.toString(req.data) : req.data;

  if (req.command === RPC_MESSAGE) {
    const encoded = b4a.from(data);
    for (const peer of Array.from(swarm.connections)) {
      peer.write(encoded);
    }
  }

  if (req.command === RPC_JOIN_ROOM) {
    const topic = createHash('sha256').update(data).digest();
    const discovery = swarm.join(topic, { server: true, client: true });
    discovery.flushed().then(() => {
      print('[Worklet] Joined topic:', topic.toString('hex'));
    });
  }
});
