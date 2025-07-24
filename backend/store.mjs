/** @typedef {import('pear-interface')} */

import b4a from 'b4a';
import fs from 'bare-fs';
import { join } from 'bare-path';
import { fileURLToPath } from 'bare-url';
import Corestore from 'corestore';
import Hyperbee from 'hyperbee';
import sodium from 'sodium-universal';
import { CREATE_GROUP, FETCH_GROUP_DETAILS, FETCH_USER_DETAILS, REGISTER_USER } from '../constants/command.mjs';
import { GROUP_STORE, USER_INFO, USER_STORE } from "../constants/index.mjs";
import RPCManager from './IPC.mjs';

const [path, platform, env] = Bare?.argv;

const ENV = JSON.parse(env) || { dev: true };

const __dirname = ENV.dev && platform === 'ios' ? fileURLToPath(`file:///Volumes/Home/practice/P2P/P2P/db`) : fileURLToPath(path);
const STORAGE_PATH = join(__dirname);

export class P2PStoreManager {
    constructor() {
        this.store = null;
        this.DBCache = new Map();
        this.RPC = RPCManager.getInstance();
        this.RPC.log('store.js', 'initConstructor', null, 'Initializing store constructor', null);
        this.#register();
    }

    #register() {
        this.RPC.onRequest(REGISTER_USER, this.registerUserHandler.bind(this));
        this.RPC.onRequest(FETCH_USER_DETAILS, this.userDetailHandler.bind(this));
        this.RPC.onRequest(FETCH_GROUP_DETAILS, this.getGroupDetailsHandler.bind(this));
        this.RPC.onRequest(CREATE_GROUP, this.createGroupHandler.bind(this));
    }

    async #initStore() {
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

    async #initDB(uniqueId) {
        if (this.DBCache.has(uniqueId)) {
            const cached = this.DBCache.get(uniqueId);
            if (cached) {
                return cached;
            }
        }

        const store = await this.#initStore();
        const ns = store.namespace(uniqueId);
        const core = ns.get({ name: uniqueId });
        await core.ready();
        const DB = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' });
        await DB.ready();
        this.DBCache.set(uniqueId, DB);
        return DB;
    }
    #_print(method, message, dataOrError) {
        this.RPC.log('store.js', method, null, message, dataOrError);
    }


    // RPC Handlers
    async registerUserHandler(user) {
        this.#_print('registerUser', 'Registering user', user);

        try {
            const db = await this.#initDB(USER_STORE);
            const { value } = await db.get(USER_INFO)
            this.#_print('registerUser', 'fetch user details ', value);
            db.put(USER_INFO, { ...value, ...user });
            this.#_print('registerUser', 'User registered successfully', user);
            return { success: true, status: 200, message: 'User registered successfully', user };
        }
        catch (error) {
            this.#_print('registerUser', 'Error registering user', error);
            throw error;
        }
    }

    async userDetailHandler() {
        this.#_print('userDetail', 'fetch user details');

        try {
            const db = await this.#initDB(USER_STORE);
            const { value } = await db.get(USER_INFO)
            this.#_print('userDetail', 'User fetched successfully', value);
            return { success: true, status: 200, message: 'User details ', data: value };
        }
        catch (error) {
            this.#_print('userDetail', 'Error fetching user', error);
            throw error;
        }
    }

    async loadOrCreateKeyPair() {
        const db = await StoreManager.#initDB(USER_STORE);
        const { value = {} } = (await db.get(USER_INFO)) || {};
        if (!value?.keyPair) {
            const publicKey = b4a.alloc(32);
            const secretKey = b4a.alloc(64);
            sodium.crypto_sign_keypair(publicKey, secretKey);

            this.keyPair = { publicKey, secretKey };
            await db.put(USER_INFO, {
                keyPair: {
                    publicKey: publicKey.toString('hex'),
                    secretKey: secretKey.toString('hex')
                }
            });
            console.log('Generated new key pair:', publicKey.toString('hex'), secretKey.toString('hex'));
        } else {
            const publicKey = b4a.from(value.keyPair.publicKey, 'hex');
            const secretKey = b4a.from(value.keyPair.secretKey, 'hex');
            this.keyPair = { publicKey, secretKey };
            sodium.crypto_sign_keypair(publicKey, secretKey);
            console.log('Existing key pair:', value.keyPair.publicKey, value.keyPair.secretKey);
        }

        return this.keyPair;
    }

    async createGroupHandler(group) {
        const { groupId } = group;
        const db = await this.#initDB(GROUP_STORE);
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
        const db = await this.#initDB(groupId);
        const seqNums = [];
        for (const msg of messages) {
            msg.sender = from === 'peer' ? 'other' : 'me';
            const seq = await db.put(msg.id, msg);
            seqNums.push(seq);
        }
        return seqNums;
    }

    async readMessagesFromStore({ groupId, limit = 100, reverse = false, ...opts }) {
        const db = await this.#initDB(groupId);
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

    async getGroupDetailsHandler() {
        const db = await this.#initDB(GROUP_STORE);
        const details = [];
        try {
            const snapshot = db.snapshot();
            for await (const { value } of snapshot.createReadStream()) {
                details.push(value)
            }
            await snapshot.close();
            return details;
        } catch (err) {
            console.error('Error reading local messages:', err);
        }
    }

    async deleteGroup(groupId) {
        const db = await this.#initDB(GROUP_STORE);
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


}

// Optional: Singleton export
const StoreManager = new P2PStoreManager();
export default StoreManager;
