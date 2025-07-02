import b4a from 'b4a';
import RPC from 'bare-rpc';
import { getCommand, RPC_LOG } from './rpc-commands.mjs';

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
                    this.log({ method: '_initIfNeeded', command: getCommand(command), message: 'Inside backend RPC handler method' });
                    const msg = this.decode(data);
                    this.log({ method: '_initIfNeeded', command: getCommand(command), message: 'Received message from UI', data: msg });
                    const result = await handler(msg);
                    const reply = this.encode(result);
                    req.reply(reply);
                    this.log({ method: '_initIfNeeded', command: getCommand(command), message: 'Replying back to UI', data: reply });
                } catch (error) {
                    this.log({ method: '_initIfNeeded', command: getCommand(command), message: 'Handler error', error });
                    req.reply(this.encode({ command: getCommand(command), error }));
                }
            }

            const subs = this.subscriptions.get(command);
            if (subs) {
                for (const fn of subs) {
                    try {
                        this.log({ method: '_initIfNeeded', command: getCommand(command), message: 'Inside subscriber function call for loop' });
                        fn(data);
                    } catch (error) {
                        this.log({ method: '_initIfNeeded', command: getCommand(command), message: 'Subscriber error', error });
                    }
                }
            }

            req.reply(this.encode({ status: 'ok', message: 'data received' }));
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
        if (!this.rpc) this.log({ method: 'send', message: 'RPC not initialized.' });

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
            brightRed: '\x1b[91m',
            brightGreen: '\x1b[92m',
            brightYellow: '\x1b[93m',
            brightBlue: '\x1b[94m',
            brightPurple: '\x1b[95m', // alias
            brightCyan: '\x1b[96m',
            brightWhite: '\x1b[97m',
        };

        const bold = options.bold ? '\x1b[1m' : '';
        const colorCode = colors[color] || colors.reset;
        const reset = colors.reset;

        return `${bold}${colorCode}${text}${reset}`;
    }
    formatLog(data) {
        if (b4a.isBuffer(data) || data instanceof Uint8Array) {
            return b4a.toString(data, 'utf-8')
        }
        else if (typeof data === 'string') {
            return data
        }
        else {
            return JSON.stringify(data, null, 2)
        }
    }
    log(logObj) {
        const prod = true;
        console.log(logObj);
        if (prod) {
            this._initIfNeeded();
            if (!this.rpc) this.log({ method: 'log', message: 'RPC not initialized.' });
            logObj.source = this.colorText('Backend Logs', 'brightPurple');
            logObj.file = this.colorText(logObj.file || 'IPC', 'cyan');
            logObj.method = this.colorText(logObj.method, 'red');
            logObj.command = this.colorText(logObj.command, 'green');
            logObj.data = this.formatLog(logObj.data);
            logObj.error = this.formatLog(logObj.error?.message)
            const req = this.rpc.request(RPC_LOG);
            req.send(JSON.stringify(logObj, null, 2));
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