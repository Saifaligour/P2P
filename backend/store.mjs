/** @typedef {import('pear-interface')} */

import fs from 'bare-fs';
import { join } from 'bare-path';
import { fileURLToPath } from 'bare-url';
import Corestore from 'corestore';
import Hyperbee from 'hyperbee';
import { GROUP_STORE } from "../constants/index.mjs";
import RPCManager from './IPC.mjs';

const { IPC } = BareKit;
const [path, platform, env] = Bare?.argv;

const ENV = JSON.parse(env) || { dev: true };

const __dirname = ENV.dev && platform === 'ios' ? fileURLToPath(`file:///Volumes/Home/practice/P2P/P2P/db`) : fileURLToPath(path);
const STORAGE_PATH = join(__dirname);

export class P2PStoreManager {
    constructor() {
        this.store = null;
        this.DBCache = new Map();
        this.RPC = RPCManager.getInstance(IPC);
    }

    async initStore() {
        if (!this.store) {
            try {
                this.#_print('initStore', `Initializing Corestore at ${STORAGE_PATH}`);
                this.store = new Corestore(STORAGE_PATH);
                await this.store.ready();
                this.#_print('initStore', `Corestore initialized successfully`);
            } catch (error) {
                this.#_print('initStore', 'Failed to initialize Corestore', error);
                if (error.message.includes('No locks available')) {
                    const lockFile = join(STORAGE_PATH, 'db', 'LOCK');
                    if (fs.existsSync(lockFile)) {
                        fs.unlinkSync(lockFile);
                        this.#_print('initStore', 'Lock file removed. Retrying Corestore initialization.');
                        this.store = new Corestore(STORAGE_PATH);
                        await this.store.ready();
                        this.#_print('initStore', 'Corestore initialized after clearing lock');
                    } else {
                        throw new Error(`Lock file not found, but lock error persists`);
                    }
                } else {
                    throw error;
                }
            }
        }
        return this.store;
    }

    async initDB(uniqueId) {
        if (this.DBCache.has(uniqueId)) {
            const cached = this.DBCache.get(uniqueId);
            if (cached) {
                return cached;
            }
        }

        const store = await this.initStore();
        const ns = store.namespace(uniqueId);
        const core = ns.get({ name: uniqueId });
        await core.ready();
        const DB = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' });
        await DB.ready();
        this.DBCache.set(uniqueId, DB);
        return DB;
    }

    async createGroup(group) {
        const { groupId } = group;
        const db = await this.initDB(GROUP_STORE);
        const metadata = {
            ...group,
            latestMessage: null,
            unreadCount: 0,
            totalMessages: 0,
            latestTimestamp: 0,
        };
        await db.put(groupId, metadata);
        return metadata;
    }

    async writeMessagesToStore(messages, from) {
        if (!messages.length) return [];
        const groupId = messages[0].groupId;
        const db = await this.initDB(groupId);
        const seqNums = [];
        for (const msg of messages) {
            msg.sender = from === 'peer' ? 'other' : 'me';
            const seq = await db.put(msg.id, msg);
            seqNums.push(seq);
        }
        return seqNums;
    }

    async readMessagesFromStore({ groupId, limit = 100, reverse = false, ...opts }) {
        const db = await this.initDB(groupId);
        const messages = [];
        try {
            const snapshot = db.snapshot();
            for await (const entry of snapshot.createReadStream()) {
                console.log('Local:', entry.key, entry.value);
                messages.push(entry.value);
            }
            await snapshot.close();
        } catch (err) {
            console.error('Error reading local messages:', err);
        }
        return reverse ? messages : messages.reverse();

    }

    async updateGroupDetails(groupId, updates) {

    }

    async getAllGroupSummaries(lastSeenMap = {}) {

    }

    async getAllGroupDetails() {
        const db = await this.initDB(GROUP_STORE);
        const details = [];
        for (let i = 0; i < db.length; i++) {
            details.push(await db.get(i));
        }
        return details;
    }

    async deleteGroup(groupId) {
        const db = await this.initDB(GROUP_STORE);
        await db.del(groupId);
    }

    async cleanup() {
        this.DBCache.clear();
        if (this.store) {
            await this.store.close();
            this.store = null;
        }
        if (fs.existsSync(STORAGE_PATH)) {
            fs.rmSync(STORAGE_PATH, { recursive: true, force: true });
        }
    }

    async closeStore() {
        this.DBCache.clear();
        if (this.store) {
            await this.store.close();
            this.store = null;
        }
    }

    #_print(method, message, dataOrError) {
        this.RPC.log('store.js', method, null, message, dataOrError);
    }

}

// Optional: Singleton export
const StoreManager = new P2PStoreManager();
export default StoreManager;
