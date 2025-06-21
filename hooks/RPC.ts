import b4a from 'b4a';
import RPC from 'bare-rpc';
import type { Duplex } from 'bare-stream';
import { Worklet } from 'react-native-bare-kit';
import bundle from './app.bundle.mjs';

type EventHandler = (data: any) => void;
type RequestHandler = (data: any) => Promise<any> | any;

class RPCManager {
  private static instance: RPCManager;
  private rpc: RPC | null = null;
  private worklet: Worklet | null = null;
  private initialized = false;

  private subscriptions = new Map<number, Set<EventHandler>>();
  private requestHandlers = new Map<number, RequestHandler>();

  private constructor() {}

  public static getInstance(): RPCManager {
    if (!RPCManager.instance) {
      RPCManager.instance = new RPCManager();
    }
    return RPCManager.instance;
  }

  private initIfNeeded() {
    if (this.initialized) return;

    this.worklet = new Worklet();
    this.worklet.start('/app.bundle', bundle);
    const { IPC } = this.worklet;

    this.rpc = new RPC(IPC as Duplex, async (req) => {
      const { command, data } = req;

      let parsed;
      try {
        if (data instanceof Uint8Array) {
          parsed = JSON.parse(new TextDecoder().decode(data));
        } else if (typeof data === 'string') {
          parsed = JSON.parse(data);
        } else {
          parsed = data;
        }
      } catch (err) {
        console.error('RPC message parse error:', err);
        return b4a.from(JSON.stringify({ error: 'Invalid data' }));
      }

      // 1. Handle request/response if handler is registered
      const handler = this.requestHandlers.get(command);
      if (handler) {
        try {
          const result = await handler(parsed);
          return b4a.from(JSON.stringify(result));
        } catch (err: any) {
          console.error(`Handler error for command ${command}:`, err);
          return b4a.from(JSON.stringify({ error: err.message }));
        }
      }

      // 2. Handle event-based subscribers
      const subs = this.subscriptions.get(command);
      if (subs) {
        for (const fn of subs) {
          try {
            fn(parsed);
          } catch (e) {
            console.error(`Subscriber error for command ${command}`, e);
          }
        }
      }

      // No response needed
      return b4a.from('{}');
    });

    this.initialized = true;
  }

  public subscribe(command: number, handler: EventHandler): () => void {
    this.initIfNeeded();

    if (!this.subscriptions.has(command)) {
      this.subscriptions.set(command, new Set());
    }

    const set = this.subscriptions.get(command)!;
    set.add(handler);

    // Unsubscribe function
    return () => {
      set.delete(handler);
      if (set.size === 0) this.subscriptions.delete(command);
    };
  }

  public onRequest(command: number, handler: RequestHandler) {
    this.initIfNeeded();
    this.requestHandlers.set(command, handler);
  }
  
  public offRequest(command: number) {
    this.initIfNeeded();
    this.requestHandlers.delete(command);
  }

  public send(command: number, data: any): void {
    this.initIfNeeded();
    if (!this.rpc) throw new Error('RPC not initialized.');

    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    const req = this.rpc.request(command);
    req.send(payload);
  }

  public stop() {
    this.rpc = null;
    this.subscriptions.clear();
    this.requestHandlers.clear();

    if (this.worklet) {
      // Optional: this.worklet.teardown();
      this.worklet = null;
    }

    this.initialized = false;
  }
}

export default RPCManager;

export const rpcService = RPCManager.getInstance();