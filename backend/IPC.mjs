import b4a from 'b4a';
import RPC from 'bare-rpc';
import { getCommand, RPC_LOG } from '../constants/command.mjs';

class RPCManager {
    static instance = null;

    rpc = null;
    initialized = false;

    subscriptions = new Map();
    requestHandlers = new Map();
    fileName = import.meta.url;

    constructor() {
        if (RPCManager.instance) return RPCManager.instance;
        this.init();
        RPCManager.instance = this;
    }

    static getInstance() {
        if (!RPCManager.instance) {
            RPCManager.instance = new RPCManager();
        }
        return RPCManager.instance;
    }

    init() {
        if (this.initialized) return;

        // eslint-disable-next-line no-undef
        this.rpc = new RPC(BareKit?.IPC, async (req) => {
            const { command, data } = req;
            const cmd = getCommand(command);
            const handler = this.requestHandlers.get(command);

            if (handler) {
                try {
                    this.log('IPC', 'handler', cmd, 'Handling request');
                    const msg = this.decode(data);
                    const result = await handler(msg);
                    const reply = this.encode(result);
                    req.reply(reply);
                    this.log('IPC', 'handler', cmd, 'Replied', reply);
                    return;
                } catch (error) {
                    this.log('IPC', 'handler', cmd, 'Handler error', error);
                    req.reply(this.encode({ command: cmd, error }));
                    return;
                }
            }

            const subs = this.subscriptions.get(command);
            if (subs) {
                for (const fn of subs) {
                    try {
                        fn(data);
                    } catch (error) {
                        this.log('IPC', 'subscriber', cmd, 'Subscriber error', error);
                    }
                }
            }

            req.reply(this.encode({ status: 'ok', message: 'data received' }));
        });

        this.initialized = true;
    }

    subscribe(command, handler) {
        this.init();

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
        this.init();
        this.requestHandlers.set(command, handler);
    }

    offRequest(command) {
        this.init();
        this.requestHandlers.delete(command);
    }

    send(command, data) {
        this.init();
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
        const prod = false;
        console.log(file, method, command, message, dataOrError || null);

        if (prod) {
            this.init();
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
