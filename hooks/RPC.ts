import RPC from 'bare-rpc';
import type { Duplex } from 'bare-stream';
import { Worklet } from 'react-native-bare-kit';
import bundle from './app.bundle.mjs';

let rpcInstance: RPC | null = null;
let workletInstance: Worklet | null | any = null;

export type RPCHandler = (data: any,command: number) => void;

export const startRPCWorklet = (
  onMessage: RPCHandler,
  args: string[]
): RPC => {
  if (rpcInstance) return rpcInstance;

  workletInstance = new Worklet();
  workletInstance.start('/app.bundle', bundle, args);
  const { IPC } = workletInstance;

  rpcInstance = new RPC(IPC as Duplex, (req: any) => {
    console.log('RPC request received, Command:', req.command);
    let message;
    console.log('RPC request received, Message:', req.data);

    if (req.data instanceof Uint8Array) {
      message = JSON.parse(new TextDecoder('utf-8').decode(req.data));
    } else if (typeof req.data === 'string') {
      message = JSON.parse(req.data);
    } else {
      message = req.data;
    }
    onMessage?.(req.command,message);
  });

  return rpcInstance;
};

export const getRPC = (): RPC => {
  if (!rpcInstance) throw new Error('RPC not initialized.');
  return rpcInstance;
};

export const stopRPCWorklet = () => {
  rpcInstance = null;
  if (workletInstance) {
    // workletInstance?.teardown();
    workletInstance = null;
  }
};
