import b4a from 'b4a';
import RPC from 'bare-rpc';
import { RPC_LOG } from "./rpc-commands.mjs";
class RPCManager {
    static instance;
    static IPC = null
    rpc = null;
    initialized = false;

    subscriptions = new Map();
    requestHandlers = new Map();
    fileName = import.meta.url;
    constructor() { }

    static getInstance(IPC) {
        if (!RPCManager.instance) {
            RPCManager.instance = new RPCManager();
        }
        if (!RPCManager.IPC && IPC) {
            RPCManager.IPC = IPC;
        }
        return RPCManager.instance;
    }

    _initIfNeeded() {
        if (this.initialized) return;

        // Initialize RPC directly (replace IPC with your actual Duplex stream if needed)
        this.rpc = new RPC(RPCManager.IPC, async (req) => {
            const { command, data } = req;
            const handler = this.requestHandlers.get(command);
            if (handler) {
                try {
                    this.log(RPC_LOG, this.fileName, `Indide backend RPC handler method ${command}`)
                    const result = await handler(data);
                    return this.encode(result);
                } catch (err) {
                    this.log(RPC_LOG, this.fileName, `Handler error for command ${command}:`, err);
                    return this.encode({ error: err.message });
                }
            }

            const subs = this.subscriptions.get(command);
            if (subs) {
                for (const fn of subs) {
                    try {
                        this.log(RPC_LOG, this.fileName, `Inside subscriber funcaiotn call for loop command ${command}`);
                        fn(data);
                    } catch (e) {
                        this.log(RPC_LOG, this.fileName, `Subscriber error for command ${command}`, e);
                    }
                }
            }

            return this.encode({ staus: 'ok', 'message': 'data received' });
        });

        this.initialized = true;
    }

    subscribe(command, handler) {
        this._initIfNeeded();

        if (!this.subscriptions.has(command)) {
            this.subscriptions.set(command, new Set());
        }

        const set = this.subscriptions.get(command);
        set.add(handler);

        return () => {
            set.delete(handler);
            if (set.size === 0) this.subscriptions.delete(command);
        };
    }

    onRequest(command, handler) {
        this._initIfNeeded();
        this.requestHandlers.set(command, handler);
    }

    offRequest(command) {
        this._initIfNeeded();
        this.requestHandlers.delete(command);
    }

    send(command, data) {
        this._initIfNeeded();
        if (!this.rpc) this.log(RPC_LOG, this.fileName, 'RPC not initialized.');

        const req = this.rpc.request(command);
        req.send(data);
    }

    log(command, ...args) {
        this._initIfNeeded();
        if (!this.rpc) this.log(RPC_LOG, this.fileName, 'RPC not initialized.');

        const payload = args.map(arg => this.decode(arg));
        const req = this.rpc.request(command);
        req.send(JSON.stringify(payload));
    }

    stop() {
        this.rpc = null;
        this.subscriptions.clear();
        this.requestHandlers.clear();
        this.initialized = false;
    }

    decode = (data) => {
        if (b4a.isBuffer(data) || data instanceof Uint8Array) {
            return b4a.toString(data, 'utf-8')
        }
        else if (typeof data === 'string') {
            return data;
        }
    }

    encode = (data) => {
        if (typeof data === 'string') {
            return b4a.from(data, 'utf-8');
        } else if (data instanceof Uint8Array || b4a.isBuffer(data)) {
            return data;
        } else {
            return b4a.from(JSON.stringify(data), 'utf-8');
        }
    }
}

export default RPCManager;
