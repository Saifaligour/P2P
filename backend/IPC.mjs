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

        this.rpc = new RPC(RPCManager.IPC, async (req) => {
            const { command, data } = req;
            const cmd = getCommand(command);
            const handler = this.requestHandlers.get(command);

            if (handler) {
                try {
                    this.log('IPC', '_initIfNeeded', cmd, 'Inside backend RPC handler method');
                    const msg = this.decode(data);
                    this.log('IPC', '_initIfNeeded', cmd, 'Received message from UI', msg);
                    const result = await handler(msg);
                    const reply = this.encode(result);
                    req.reply(reply);
                    this.log('IPC', '_initIfNeeded', cmd, 'Replying back to UI', reply);
                } catch (error) {
                    this.log('IPC', '_initIfNeeded', cmd, 'Handler error', error);
                    req.reply(this.encode({ command: cmd, error }));
                }
            }

            const subs = this.subscriptions.get(command);
            if (subs) {
                for (const fn of subs) {
                    try {
                        this.log('IPC', '_initIfNeeded', cmd, 'Inside subscriber function call for loop');
                        fn(data);
                    } catch (error) {
                        this.log('IPC', '_initIfNeeded', cmd, 'Subscriber error', error);
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
        if (!this.rpc) this.log('IPC', 'send', getCommand(command), 'RPC not initialized.');

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
            brightPurple: '\x1b[95m',
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
            return b4a.toString(data, 'utf-8');
        } else if (typeof data === 'string') {
            return data;
        } else {
            return JSON.stringify(data, null, 2);
        }
    }

    isError(obj) {
        return obj instanceof Error;
    }

    log(file, method, command, message, dataOrError) {
        const prod = true;
        console.log(file, method, command, message, dataOrError || null);

        if (prod) {
            this._initIfNeeded();
            const logEntry = {
                source: this.colorText('Backend Logs', 'brightPurple'),
                file: this.colorText(file || 'IPC', 'cyan'),
                method: this.colorText(method, 'red')
            };

            if (command != null) logEntry.command = this.colorText(command, 'green');

            if (message != null && dataOrError != null) {
                logEntry.message = message;
                if (this.isError(dataOrError)) {
                    logEntry.error = this.formatLog(dataOrError?.message);
                } else {
                    logEntry.data = this.formatLog(dataOrError);
                }
            } else if (typeof message === 'string') {
                logEntry.message = message;
            } else if (message != null) {
                if (this.isError(message)) {
                    logEntry.error = this.formatLog(message);
                } else {
                    logEntry.data = this.formatLog(message);
                }
            }

            const req = this.rpc.request(RPC_LOG);
            req.send(JSON.stringify(logEntry, null, 2));
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
    };

    encode = (data) => {
        if (typeof data === 'string' || data instanceof Uint8Array || b4a.isBuffer(data)) {
            return data;
        } else {
            return JSON.stringify(data);
        }
    };
}

export default RPCManager;
