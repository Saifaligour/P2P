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
                    this.log('[IPC]', '[_initIfNeeded]', `Inside backend RPC handler method ${command}`)
                    const msg = this.decode(data)
                    this.log('[IPC]', '[_initIfNeeded]', `Received message from UI`, msg)
                    const result = await handler(msg);
                    const reply = this.encode(result)
                    req.reply(reply);
                    this.log('[IPC]', '[_initIfNeeded]', `Replying back to UI`, reply)
                } catch (err) {
                    this.log('[IPC]', '[_initIfNeeded]', `Handler error for command ${command}:`, err.message);
                    req.reply(this.encode({ error: err.message }));
                }
            }

            const subs = this.subscriptions.get(command);
            if (subs) {
                for (const fn of subs) {
                    try {
                        this.log('[IPC]', '[_initIfNeeded]', `Inside subscriber function call for loop command ${command}`);
                        fn(data);
                    } catch (e) {
                        this.log('[IPC]', '[_initIfNeeded]', `Subscriber error for command ${command}`, e);
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
        if (!this.rpc) this.log('[IPC]', '[send]', 'RPC not initialized.');

        const req = this.rpc.request(command);
        req.send(this.encode(data));
        return req;
    }

    colorText(text, color, options = {}) {
        const colors = {
            black: '\x1b[30m',
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m',
            gray: '\x1b[90m',
        };

        const command = {
            0: "cyan",
            1: "red",
            2: "green",
            3: "yellow",
            5: "red",
            4: "black",
            6: "magenta",
            7: "white",
            8: "gray",
        }

        const bold = options.bold ? '\x1b[1m' : '';
        const colorCode = colors[command[color]] || colors.reset;
        const reset = colors.reset;

        return `${bold}${colorCode}${text}${reset}`;
    }

    log(...args) {
        const prod = true
        console.log(...args)
        if (prod) {
            this._initIfNeeded();
            if (!this.rpc) this.log('[IPC]', '[log]', 'RPC not initialized.');
            args.unshift('Backend Logs:')
            const payload = args.map((arg, i) => {
                if (b4a.isBuffer(arg) || arg instanceof Uint8Array) {
                    arg = b4a.toString(arg, 'utf-8')
                }
                if (Array.isArray(arg)) {
                    arg = JSON.stringify(arg)
                }
                if (i <= 2)
                    return this.colorText(arg, i);
                else
                    return arg
            });
            payload.push('\n')

            const req = this.rpc.request(RPC_LOG);
            req.send(JSON.stringify(payload.join(',')));
        }
    }

    stop() {
        this.rpc = null;
        this.subscriptions.clear();
        this.requestHandlers.clear();
        this.initialized = false;
    }

    decode = (data, encoding = 'utf-8') => {
        if (data == null) return {};
        let str;
        if (b4a.isBuffer(data) || data instanceof Uint8Array) {
            str = b4a.toString(data, encoding);
        }
        try {
            return JSON.parse(str);
        } catch {
            return str;
        }
    }

    encode = (data) => {
        if (typeof data === 'string' || data instanceof Uint8Array || b4a.isBuffer(data)) {
            return data;
        } else {
            return JSON.stringify(data);
        }
    }
}

export default RPCManager;