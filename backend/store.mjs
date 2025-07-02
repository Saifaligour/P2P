/** @typedef {import('pear-interface')} */

import Autobase from 'autobase';
import fs from 'bare-fs';
import { join } from 'bare-path';
import { fileURLToPath } from 'bare-url';
import Corestore from 'corestore';
import RPCManager from './IPC.mjs';

const { IPC } = BareKit;
const [path, platform, env] = Bare?.argv;
const RPC = RPCManager.getInstance(IPC);
const META_GROUP = 'group_details';
let store = null;
const autobaseCache = new Map();
const print = (args) => {
    args.file = 'store.js'
    RPC.log(args);
};
const ENV = JSON.parse(env) || { dev: true };
print({ method: 'JSON.parse', message: `Bare env data`, data: Bare?.argv });
const __dirname = (ENV.dev && platform === 'ios') ? fileURLToPath(`file:///Volumes/Home/practice/P2P/P2P/`) : fileURLToPath(path);
const STORAGE_PATH = join(__dirname, ENV.dev ? `${platform}_store` : 'store');

// if (ENV.dev) {
//     if (fs.existsSync(STORAGE_PATH)) {
//         fs.rmSync(STORAGE_PATH, {
//             recursive: true,
//             force: true
//         })
//     }
// }

if (!fs.existsSync(STORAGE_PATH)) fs.mkdirSync(STORAGE_PATH, { recursive: true });

export async function initStore() {
    if (!store) {
        try {
            print({ method: 'initStore', message: `Initializing Corestore at ${STORAGE_PATH}` });
            store = new Corestore(STORAGE_PATH, { lock: true, replicate: true });
            print({ method: 'initStore', message: `Corestore instance created` });
            await store.ready();
            print({ method: 'initStore', message: `Corestore initialized successfully` });
        } catch (error) {
            print({ method: 'initStore', message: 'Failed to initialize Corestore', error });
            if (error.message.includes('No locks available')) {
                print({ method: 'initStore', message: 'Lock conflict detected. Attempting to clear lock file.' });
                try {
                    const lockFile = join(STORAGE_PATH, 'db', 'LOCK');
                    if (fs.existsSync(lockFile)) {
                        fs.unlinkSync(lockFile);
                        print({ method: 'initStore', message: 'Lock file removed. Retrying Corestore initialization.' });
                        store = new Corestore(STORAGE_PATH, { lock: true, replicate: true });
                        await store.ready();
                        print({ method: 'initStore', message: 'Corestore initialized after clearing lock' });
                    } else {
                        throw new Error(`Lock file not found, but lock error persists`);
                    }
                } catch (retryError) {
                    print({ method: 'initStore', message: 'Retry failed', error: retryError });
                    throw retryError;
                }
            } else {
                throw error;
            }
        }
    }
    return store;
}

export async function initAutobase(uniqueId) {
    print({ method: 'initAutobase', message: `autobase cache size: ${autobaseCache.size}` });

    if (autobaseCache.has(uniqueId)) {
        const cached = autobaseCache.get(uniqueId);
        if (cached) {
            print({ method: 'initAutobase', message: `Returning cached autobase for ${uniqueId}` });
            await cached.ready();
            return cached;
        }
    }

    try {
        print({ method: 'initAutobase', message: `Creating autobase for ${uniqueId}` });
        const store = await initStore();
        const s = store.namespace(uniqueId);
        const base = new Autobase(s, {
            valueEncoding: 'json',
            open: (s) => s.get('view', { valueEncoding: 'json' }),
            apply: async (nodes, view) => {
                for (const node of nodes) {
                    await view.append(node.value);
                }
            }
        });
        autobaseCache.set(uniqueId, base);
        await base.ready();
        print({ method: 'initAutobase', message: `Autobase created and ready for ${uniqueId}` });
        return base;
    } catch (error) {
        print({ method: 'initAutobase', message: `Failed to create autobase for ${uniqueId}`, error });
        throw error;
    }
}

export async function createGroup(group) {
    const { groupId } = group;
    try {
        print({ method: 'createGroup', message: `Creating group ${groupId}` });
        const metaBase = await initAutobase(META_GROUP);
        const metadata = {
            ...group,
            latestMessage: null,
            unreadCount: 0,
            totalMessages: 0,
            latestTimestamp: 0,
        };
        await metaBase.append(metadata);
        print({ method: 'createGroup', message: `Metadata appended for group ${groupId}` });
        return metadata;
    } catch (error) {
        print({ method: 'createGroup', message: `Failed to create group ${groupId}`, error });
        throw error;
    }
}

export async function writeMessagesToStore(messages, from) {
    if (!messages.length) {
        print({ method: 'writeMessagesToStore', message: 'No messages to write' });
        return [];
    }
    const groupId = messages[0].groupId;
    try {
        print({ method: 'writeMessagesToStore', message: `Writing ${messages.length} messages to group ${groupId}` });
        const base = await initAutobase(groupId);
        const seqNums = [];
        for (const msg of messages) {
            msg.sender = from === 'peer' ? 'other' : 'me';
            const seq = await base.append(msg);
            print({ method: 'writeMessagesToStore', message: `Message appended with seq ${seq} for group ${groupId}` });
            seqNums.push(seq);
        }
        print({ method: 'writeMessagesToStore', message: `Successfully wrote ${messages.length} messages to group ${groupId}` });
        return seqNums;
    } catch (error) {
        print({ method: 'writeMessagesToStore', message: `Failed to write messages to group ${groupId}`, error });
        throw error;
    }
}

export async function readMessagesFromStore(data) {
    const { groupId, limit = 100, reverse = false, ...opts } = data;
    try {
        print({ method: 'readMessagesFromStore', message: `Reading messages for group ${groupId}` });
        const base = await initAutobase(groupId);
        const messages = [];

        // const stream = base.view.createReadStream({
        //     limit,
        //     reverse,
        //     ...opts
        // });

        // for await (const node of stream) {
        //     if (node) {
        //         messages.push(node);
        //         print(`[readMessagesFromStore] Read message for group ${groupId}`);
        //     }
        // }
        for (let i = 0; i < base.view.length; i++) {
            messages.push(await base.view.get(i));
        }
        const result = reverse ? messages : messages.reverse();
        print({ method: 'readMessagesFromStore', message: `Read ${result.length} messages for group ${groupId}` });
        return result;
    } catch (error) {
        print({ method: 'readMessagesFromStore', message: `Failed to read messages for group ${groupId}`, error });
        throw error;
    }
}

export async function updateGroupMetadata(groupId, updates) {
    try {
        print({ method: 'updateGroupMetadata', message: `Updating metadata for group ${groupId}` });
        const metaBase = await initAutobase(META_GROUP);
        let current = {};
        const stream = metaBase.view.createReadStream();
        print({ method: 'updateGroupMetadata', message: `Created read stream for metadata update of group ${groupId}` });
        for await (const entry of stream) {
            if (entry.value?.groupId === groupId && !entry.value?.deleted) {
                current = entry.value;
                print({ method: 'updateGroupMetadata', message: `Found metadata for group ${groupId}` });
                break;
            }
        }
        const updated = { ...current, ...updates };
        await metaBase.append(updated);
        print({ method: 'updateGroupMetadata', message: `Metadata updated for group ${groupId}` });
        return updated;
    } catch (error) {
        print({ method: 'updateGroupMetadata', message: `Failed to update metadata for group ${groupId}`, error });
        throw error;
    }
}

export async function getGroupSummary(groupId, lastSeenTimestamp = 0) {
    try {
        print({ method: 'getGroupSummary', message: `Fetching summary for group ${groupId} with last seen ${lastSeenTimestamp}` });
        const metaBase = await initAutobase(META_GROUP);
        let metadata = null;
        const stream = metaBase.view.createReadStream();
        print({ method: 'getGroupSummary', message: `Created read stream for group summary of ${groupId}` });
        for await (const entry of stream) {
            if (entry.value?.groupId === groupId && !entry.value?.deleted) {
                metadata = entry.value;
                print({ method: 'getGroupSummary', message: `Found metadata for group ${groupId}` });
                break;
            }
        }
        if (!metadata) {
            print({ method: 'getGroupSummary', message: `Group ${groupId} not found` });
            return null;
        }
        const base = await initAutobase(groupId);
        let unreadCount = 0;
        if (lastSeenTimestamp) {
            const stream = base.view.createReadStream({ limit: 100, reverse: true });
            print({ method: 'getGroupSummary', message: `Created read stream for unread count of group ${groupId}` });
            for await (const node of stream) {
                if (node.value?.timestamp > lastSeenTimestamp) unreadCount++;
                else break;
            }
        }
        const result = {
            ...metadata,
            unreadCount,
            totalMessages: base.view.length
        };
        print({ method: 'getGroupSummary', message: `Fetched summary for group ${groupId} with ${unreadCount} unread messages` });
        return result;
    } catch (error) {
        print({ method: 'getGroupSummary', message: `Failed to fetch summary for group ${groupId}`, error });
        throw error;
    }
}

export async function getAllGroupSummaries(lastSeenMap = {}) {
    try {
        print({ method: 'getAllGroupSummaries', message: 'Fetching all group summaries' });
        const metaBase = await initAutobase(META_GROUP);
        const summaries = [];
        const stream = metaBase.view.createReadStream();
        print({ method: 'getAllGroupSummaries', message: 'Created read stream for all group summaries' });
        for await (const entry of stream) {
            if (entry.value?.groupId && !entry.value?.deleted) {
                const meta = entry.value;
                summaries.push({
                    ...meta,
                    unreadCount: lastSeenMap[meta.groupId]
                        ? meta.latestTimestamp > lastSeenMap[meta.groupId] ? 1 : 0
                        : 0
                });
                print({ method: 'getAllGroupSummaries', message: `Added summary for group ${meta.groupId}` });
            }
        }
        print({ method: 'getAllGroupSummaries', message: `Fetched ${summaries.length} group summaries` });
        return summaries;
    } catch (error) {
        print({ method: 'getAllGroupSummaries', message: 'Failed to fetch all group summaries', error });
        throw error;
    }
}

export async function getAllGroupDetails() {
    try {
        print({ method: 'getAllGroupDetails', message: 'Fetching all group details' });
        const metaBase = await initAutobase(META_GROUP);
        const details = [];
        for (let i = 0; i < metaBase.view.length; i++) {
            details.push(await metaBase.view.get(i));
        }
        print({ method: 'getAllGroupDetails', message: `Fetched ${details.length} group details` });
        return details;
    } catch (error) {
        print({ method: 'getAllGroupDetails', message: 'Failed to fetch all group details', error });
        throw error;
    }
}

export async function deleteGroup(groupId) {
    try {
        print({ method: 'deleteGroup', message: `Deleting group ${groupId}` });
        const metaBase = await initAutobase(META_GROUP);
        await metaBase.append({ groupId, deleted: true });
        print({ method: 'deleteGroup', message: `Group ${groupId} deleted successfully` });
    } catch (error) {
        print({ method: 'deleteGroup', message: `Failed to delete group ${groupId}`, error });
        throw error;
    }
}

export async function cleanup() {
    try {
        print({ method: 'cleanup', message: 'Starting cleanup' });
        autobaseCache.clear();
        if (store) {
            await store.close();
            store = null;
            print({ method: 'cleanup', message: 'Corestore closed' });
        }
        if (fs.existsSync(STORAGE_PATH)) {
            fs.rmSync(STORAGE_PATH, { recursive: true, force: true });
            print({ method: 'cleanup', message: `Removed storage directory ${STORAGE_PATH}` });
        }
        print({ method: 'cleanup', message: 'Cleanup completed' });
    } catch (error) {
        print({ method: 'cleanup', message: 'Failed to cleanup', error });
        throw error;
    }
}

export async function closeStore() {
    try {
        print({ method: 'closeStore', message: 'Starting Closing' });
        autobaseCache.clear();
        if (store) {
            await store.close();
            store = null;
            print({ method: 'closeStore', message: 'Corestore closed' });
        }
        print({ method: 'closeStore', message: 'Closing completed' });
    } catch (error) {
        print({ method: 'closeStore', message: 'Failed to cleanup', error });
        throw error;
    }
}
