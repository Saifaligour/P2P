import b4a from 'b4a';
import RPC from 'bare-rpc';
import { RPC_LOG } from './rpc-commands.mjs';
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
                    this.log(this.fileName, `Indide backend RPC handler method ${command}`)
                    const result = await handler(data);
                    req.reply(this.encode(result));
                } catch (err) {
                    this.log(this.fileName, `Handler error for command ${command}:`, err.message);
                    req.reply(this.encode({ error: err.message }));
                }
            }

            const subs = this.subscriptions.get(command);
            if (subs) {
                for (const fn of subs) {
                    try {
                        this.log(this.fileName, `Inside subscriber funcaiotn call for loop command ${command}`);
                        fn(data);
                    } catch (e) {
                        this.log(this.fileName, `Subscriber error for command ${command}`, e);
                    }
                }
            }

            req.reply(this.encode({ staus: 'ok', 'message': 'data received' }));
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
        if (!this.rpc) this.log(this.fileName, 'RPC not initialized.');

        const req = this.rpc.request(command);
        req.send(this.encode(data));
        return req;
    }

    log(...args) {
        const prod = false
        console.log(...args)
        if (prod) {
            this._initIfNeeded();
            if (!this.rpc) this.log(this.fileName, 'RPC not initialized.');

            const payload = args.map(arg => this.decode(arg));
            const req = this.rpc.request(RPC_LOG);
            req.send(JSON.stringify(payload));
        }
    }

    stop() {
        this.rpc = null;
        this.subscriptions.clear();
        this.requestHandlers.clear();
        this.initialized = false;
    }

    decode = (data, format = 'utf-8') => {
        if (b4a.isBuffer(data) || data instanceof Uint8Array) {
            return b4a.toString(data, format)
        }
        else if (typeof data === 'string') {
            return data;
        }
        else if (data instanceof Object) {
            return JSON.stringify(data)
        }
    }

    encode = (data) => {
        if (typeof data === 'string' || data instanceof Uint8Array || b4a.isBuffer(data)) {
        } else {
            return JSON.stringify(data);
        }
    }
}

export default RPCManager;
