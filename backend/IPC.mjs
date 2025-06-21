import b4a from 'b4a';
import RPC from 'bare-rpc';

class RPCManager {
    static instance;
    static IPC = null
    rpc = null;
    initialized = false;

    subscriptions = new Map();
    requestHandlers = new Map();

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
            const parsedData = this.parseData(data);
            const handler = this.requestHandlers.get(command);
            if (handler) {
                try {
                    const result = await handler(parsedData);
                    return b4a.from(JSON.stringify(result));
                } catch (err) {
                    console.error(`Handler error for command ${command}:`, err);
                    return b4a.from(JSON.stringify({ error: err.message }));
                }
            }

            const subs = this.subscriptions.get(command);
            if (subs) {
                for (const fn of subs) {
                    try {
                        fn(parsedData);
                    } catch (e) {
                        console.error(`Subscriber error for command ${command}`, e);
                    }
                }
            }

            return b4a.from('{}');
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
        if (!this.rpc) throw new Error('RPC not initialized.');

        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        const req = this.rpc.request(command);
        req.send(payload);
    }

    log(command, ...args) {
        this._initIfNeeded();
        if (!this.rpc) throw new Error('RPC not initialized.');

        // const payload = args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)));
        const req = this.rpc.request(command);
        req.send(JSON.stringify(args));
    }

    stop() {
        this.rpc = null;
        this.subscriptions.clear();
        this.requestHandlers.clear();
        this.initialized = false;
    }

    parseData = (data) => {
        if (b4a.isBuffer(data) || data instanceof Uint8Array) {
            return JSON.parse(b4a.toString(data, 'utf-8'));
        }
        else if (typeof data === 'string') {
            return JSON.parse(data);
        } else {
            return data;
        }
    }
}

export default RPCManager;
