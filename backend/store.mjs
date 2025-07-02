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

function print(method, message, dataOrError) {
    RPC.log('store.js', method, null, message, dataOrError);
}

const ENV = JSON.parse(env) || { dev: true };
print('JSON.parse', `Bare env data`, Bare?.argv);

const __dirname =
    ENV.dev && platform === 'ios'
        ? fileURLToPath(`file:///Volumes/Home/practice/P2P/P2P/`)
        : fileURLToPath(path);

const STORAGE_PATH = join(__dirname, ENV.dev ? `${platform}_store` : 'store');

// if (ENV.dev) {
//     if (fs.existsSync(STORAGE_PATH)) {
//         fs.rmSync(STORAGE_PATH, {
//             recursive: true,
//             force: true
//         })
//     }
// }

if (!fs.existsSync(STORAGE_PATH)) {
    try {
        fs.mkdirSync(STORAGE_PATH, { recursive: true });
    } catch (error) {
        print('mkdirSync', `Failed to create storage directory ${STORAGE_PATH}`, error);
    }
}

export async function initStore() {
    if (!store) {
        try {
            print('initStore', `Initializing Corestore at ${STORAGE_PATH}`);
            store = new Corestore(STORAGE_PATH, { lock: true, replicate: true });
            print('initStore', `Corestore instance created`);
            await store.ready();
            print('initStore', `Corestore initialized successfully`);
        } catch (error) {
            print('initStore', 'Failed to initialize Corestore', error);
            if (error.message.includes('No locks available')) {
                print('initStore', 'Lock conflict detected. Attempting to clear lock file.');
                const lockFile = join(STORAGE_PATH, 'db', 'LOCK');
                if (fs.existsSync(lockFile)) {
                    fs.unlinkSync(lockFile);
                    print('initStore', 'Lock file removed. Retrying Corestore initialization.');
                    store = new Corestore(STORAGE_PATH, { lock: true, replicate: true });
                    await store.ready();
                    print('initStore', 'Corestore initialized after clearing lock');
                } else {
                    throw new Error(`Lock file not found, but lock error persists`);
                }
            } else {
                throw error;
            }
        }
    }
    return store;
}

export async function initAutobase(uniqueId) {
    try {
        print('initAutobase', `autobase cache size: ${autobaseCache.size}`);

        if (autobaseCache.has(uniqueId)) {
            const cached = autobaseCache.get(uniqueId);
            if (cached) {
                print('initAutobase', `Returning cached autobase for ${uniqueId}`);
                await cached.ready();
                return cached;
            }
        }

        print('initAutobase', `Creating autobase for ${uniqueId}`);
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
        print('initAutobase', `Autobase created and ready for ${uniqueId}`);
        return base;
    } catch (error) {
        print('initAutobase', `Failed to create autobase for ${uniqueId}`, error);
        throw error;
    }
}

export async function createGroup(group) {
    try {
        const { groupId } = group;
        print('createGroup', `Creating group ${groupId}`);
        const metaBase = await initAutobase(META_GROUP);
        const metadata = {
            ...group,
            latestMessage: null,
            unreadCount: 0,
            totalMessages: 0,
            latestTimestamp: 0,
        };
        await metaBase.append(metadata);
        print('createGroup', `Metadata appended for group ${groupId}`);
        return metadata;
    } catch (error) {
        print('createGroup', `Failed to create group`, error);
        throw error;
    }
}

export async function writeMessagesToStore(messages, from) {
    try {
        if (!messages.length) {
            print('writeMessagesToStore', 'No messages to write');
            return [];
        }
        const groupId = messages[0].groupId;
        print('writeMessagesToStore', `Writing ${messages.length} messages to group ${groupId}`);
        const base = await initAutobase(groupId);
        const seqNums = [];
        for (const msg of messages) {
            msg.sender = from === 'peer' ? 'other' : 'me';
            const seq = await base.append(msg);
            print('writeMessagesToStore', `Message appended with seq ${seq} for group ${groupId}`);
            seqNums.push(seq);
        }
        print('writeMessagesToStore', `Successfully wrote ${messages.length} messages to group ${groupId}`);
        return seqNums;
    } catch (error) {
        print('writeMessagesToStore', `Failed to write messages to group ${messages[0]?.groupId || 'unknown'}`, error);
        throw error;
    }
}

export async function readMessagesFromStore(data) {
    try {
        const { groupId, limit = 100, reverse = false, ...opts } = data;
        print('readMessagesFromStore', `Reading messages for group ${groupId}`);
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
        print('readMessagesFromStore', `Read ${result.length} messages for group ${groupId}`);
        return result;
    } catch (error) {
        print('readMessagesFromStore', `Failed to read messages for group ${data.groupId || 'unknown'}`, error);
        throw error;
    }
}

export async function updateGroupMetadata(groupId, updates) {
    try {
        print('updateGroupMetadata', `Updating metadata for group ${groupId}`);
        const metaBase = await initAutobase(META_GROUP);
        let current = {};
        const stream = metaBase.view.createReadStream();
        print('updateGroupMetadata', `Created read stream for metadata update of group ${groupId}`);
        for await (const entry of stream) {
            if (entry.value?.groupId === groupId && !entry.value?.deleted) {
                current = entry.value;
                print('updateGroupMetadata', `Found metadata for group ${groupId}`);
                break;
            }
        }
        const updated = { ...current, ...updates };
        await metaBase.append(updated);
        print('updateGroupMetadata', `Metadata updated for group ${groupId}`);
        return updated;
    } catch (error) {
        print('updateGroupMetadata', `Failed to update metadata for group ${groupId}`, error);
        throw error;
    }
}

export async function getGroupSummary(groupId, lastSeenTimestamp = 0) {
    try {
        print('getGroupSummary', `Fetching summary for group ${groupId} with last seen ${lastSeenTimestamp}`);
        const metaBase = await initAutobase(META_GROUP);
        let metadata = null;
        const stream = metaBase.view.createReadStream();
        print('getGroupSummary', `Created read stream for group summary of ${groupId}`);
        for await (const entry of stream) {
            if (entry.value?.groupId === groupId && !entry.value?.deleted) {
                metadata = entry.value;
                print('getGroupSummary', `Found metadata for group ${groupId}`);
                break;
            }
        }
        if (!metadata) {
            print('getGroupSummary', `Group ${groupId} not found`);
            return null;
        }
        const base = await initAutobase(groupId);
        let unreadCount = 0;
        if (lastSeenTimestamp) {
            const stream = base.view.createReadStream({ limit: 100, reverse: true });
            print('getGroupSummary', `Created read stream for unread count of group ${groupId}`);
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
        print('getGroupSummary', `Fetched summary for group ${groupId} with ${unreadCount} unread messages`);
        return result;
    } catch (error) {
        print('getGroupSummary', `Failed to fetch summary for group ${groupId}`, error);
        throw error;
    }
}

export async function getAllGroupSummaries(lastSeenMap = {}) {
    try {
        print('getAllGroupSummaries', 'Fetching all group summaries');
        const metaBase = await initAutobase(META_GROUP);
        const summaries = [];
        const stream = metaBase.view.createReadStream();
        print('getAllGroupSummaries', 'Created read stream for all group summaries');
        for await (const entry of stream) {
            if (entry.value?.groupId && !entry.value?.deleted) {
                const meta = entry.value;
                summaries.push({
                    ...meta,
                    unreadCount: lastSeenMap[meta.groupId]
                        ? meta.latestTimestamp > lastSeenMap[meta.groupId] ? 1 : 0
                        : 0
                });
                print('getAllGroupSummaries', `Added summary for group ${meta.groupId}`);
            }
        }
        print('getAllGroupSummaries', `Fetched ${summaries.length} group summaries`);
        return summaries;
    } catch (error) {
        print('getAllGroupSummaries', 'Failed to fetch all group summaries', error);
        throw error;
    }
}

export async function getAllGroupDetails() {
    try {
        print('getAllGroupDetails', 'Fetching all group details');
        const metaBase = await initAutobase(META_GROUP);
        const details = [];
        for (let i = 0; i < metaBase.view.length; i++) {
            details.push(await metaBase.view.get(i));
        }
        print('getAllGroupDetails', `Fetched ${details.length} group details`);
        return details;
    } catch (error) {
        print('getAllGroupDetails', 'Failed to fetch all group details', error);
        throw error;
    }
}

export async function deleteGroup(groupId) {
    try {
        print('deleteGroup', `Deleting group ${groupId}`);
        const metaBase = await initAutobase(META_GROUP);
        await metaBase.append({ groupId, deleted: true });
        print('deleteGroup', `Group ${groupId} deleted successfully`);
    } catch (error) {
        print('deleteGroup', `Failed to delete group ${groupId}`, error);
        throw error;
    }
}

export async function cleanup() {
    try {
        print('cleanup', 'Starting cleanup');
        autobaseCache.clear();
        if (store) {
            await store.close();
            store = null;
            print('cleanup', 'Corestore closed');
        }
        if (fs.existsSync(STORAGE_PATH)) {
            fs.rmSync(STORAGE_PATH, { recursive: true, force: true });
            print('cleanup', `Removed storage directory ${STORAGE_PATH}`);
        }
        print('cleanup', 'Cleanup completed');
    } catch (error) {
        print('cleanup', 'Failed to cleanup', error);
        throw error;
    }
}

export async function closeStore() {
    try {
        print('closeStore', 'Starting Closing');
        autobaseCache.clear();
        if (store) {
            await store.close();
            store = null;
            print('closeStore', 'Corestore closed');
        }
        print('closeStore', 'Closing completed');
    } catch (error) {
        print('closeStore', 'Failed to cleanup', error);
        throw error;
    }
}
