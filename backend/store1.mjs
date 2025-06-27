/** @typedef {import('pear-interface')} */

import Autobase from 'autobase';
import Corestore from 'corestore';
import fs from 'fs';
import { join } from 'path';
// import { RPC_LOG } from './rpc-commands.mjs';

// const { IPC } = BareKit;
// const __dirname = fileURLToPath('file:///Volumes/Home/practice/P2P/P2P') || fileURLToPath(Bare.argv[0]);
const STORAGE_PATH = './test_store' //join(__dirname, 'store');

if (!fs.existsSync(STORAGE_PATH)) fs.mkdirSync(STORAGE_PATH, { recursive: true });
const META_GROUP = 'group_details';
// const RPC = RPCManager.getInstance(IPC)
let store = null;
// Cache for autobase instances
const autobaseCache = new Map();

const print = (...args) => {
    console.log(...args)
    // RPC.log('[store.js]', ...args);

};

async function initStore() {
    if (!store) {
        try {
            print(`[initStore] Initializing Corestore at ${STORAGE_PATH}`);
            // Disable replication to prevent data sharing with peers
            store = new Corestore(STORAGE_PATH, { lock: true, replicate: false });
            print('[initStore] Corestore instance created');
            await store.ready();
            print('[initStore] Corestore initialized successfully');
        } catch (error) {
            print(`[initStore] Failed to initialize Corestore: ${error.message}, Stack: ${error.stack}`);
            if (error.message.includes('No locks available')) {
                print('[initStore] Lock conflict detected. Attempting to clear lock file.');
                try {
                    const lockFile = join(STORAGE_PATH, 'db', 'LOCK');
                    if (fs.existsSync(lockFile)) {
                        fs.unlinkSync(lockFile);
                        print('[initStore] Lock file removed. Retrying Corestore initialization.');
                        store = new Corestore(STORAGE_PATH, { lock: true, replicate: false });
                        await store.ready();
                        print('[initStore] Corestore initialized after clearing lock');
                    } else {
                        throw new Error('Lock file not found, but lock error persists');
                    }
                } catch (retryError) {
                    print(`[initStore] Retry failed: ${retryError.message}, Stack: ${retryError.stack}`);
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
    // Check cache first
    if (autobaseCache.has(uniqueId)) {
        const cached = autobaseCache.get(uniqueId);
        if (cached) {
            print(`[initAutobase] Returning cached autobase for group ${uniqueId}`);
            return cached;
        }
    }

    try {
        print(`[initAutobase] Creating autobase for group ${uniqueId}`);
        const store = await initStore();
        print(`[initAutobase] Group core created for ${uniqueId}`);
        print(`[initAutobase] Group core ready for ${uniqueId}`);

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
        print(`[initAutobase] Autobase instance created for group ${uniqueId}`);
        await base.ready();
        print(`[initAutobase] Autobase created successfully for group ${uniqueId}`);

        // Cache the autobase instance
        autobaseCache.set(uniqueId, base);
        return base;
    } catch (error) {
        print(`[initAutobase] Failed to create autobase for group ${uniqueId}: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}

export async function createGroup(group) {
    const { groupId } = group;
    try {
        print(`[createGroup] Creating group ${groupId}`);
        const metaBase = await initAutobase(META_GROUP);

        // for await (const entry of metaBase.view.createReadStream()) {
        //     if (entry.value?.groupId === groupId && !entry.value?.deleted) {
        //       print( `Group ${groupId} already exists`);
        //         throw new Error(`Group ${groupId} already exists`);
        //     }
        // }

        const metadata = {
            ...group,
            latestMessage: null,
            unreadCount: 0,
            totalMessages: 0,
            latestTimestamp: 0,
        };

        await metaBase.append(metadata);
        print(`[createGroup] Metadata appended for group ${groupId}`);
        // await initAutobase(groupId);
        // print(`Group ${groupId} created successfully`);
        return metadata;
    } catch (error) {
        print(`[createGroup] Failed to create group ${groupId}: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}

export async function writeMessagesToStore(messages) {
    if (!messages.length) {
        print('[writeMessagesToStore] No messages to write');
        return [];
    }
    console.log(messages);
    const groupId = messages[0].groupId;
    try {
        print(`[writeMessagesToStore] Writing ${messages.length} messages to group ${groupId}`);
        const base = await initAutobase(groupId);
        console.log('Autobase size', autobaseCache.size);

        const seqNums = [];
        for (const msg of messages) {
            const seq = await base.append(msg);
            print(`[writeMessagesToStore] Message appended with seq ${seq} for group ${groupId}`);
            seqNums.push(seq);
        }

        // await updateGroupMetadata(groupId, {
        //     messages: messages[messages.length - 1].text,
        //     latestTimestamp: messages[messages.length - 1].timestamp,
        //     totalMessages: base.view.length
        // });

        print(`[writeMessagesToStore] Successfully wrote ${messages.length} messages to group ${groupId}`);
        return seqNums;
    } catch (error) {
        print(`[writeMessagesToStore] Failed to write messages to group ${groupId}: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}

export async function readMessagesFromStore(groupId, opts = {}) {
    try {
        print(`[readMessagesFromStore] Reading messages for group ${groupId} with options ${JSON.stringify(opts)}`);
        const base = await initAutobase(groupId);
        const messages = [];
        const { limit = 100 } = opts;

        const stream = base.view.createReadStream({
            limit,
            reverse: opts.reverse || false,
            ...opts
        });
        print(`[readMessagesFromStore] Created read stream for group ${groupId}`);

        for await (const node of stream) {
            if (node) {
                messages.push(node);
                print(`[readMessagesFromStore] Read message for group ${groupId}`);
            }
        }

        const result = opts.reverse ? messages : messages.reverse();
        print(`[readMessagesFromStore] Read ${result.length} messages for group ${groupId}`);
        return result;
    } catch (error) {
        print(`[readMessagesFromStore] Failed to read messages for group ${groupId}: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}

async function updateGroupMetadata(groupId, updates) {
    try {
        print(`[updateGroupMetadata] Updating metadata for group ${groupId}`);
        const metaBase = await initAutobase(META_GROUP);
        let current = {};

        const stream = metaBase.view.createReadStream();
        print(`[updateGroupMetadata] Created read stream for metadata update of group ${groupId}`);
        for await (const entry of stream) {
            if (entry.value?.groupId === groupId && !entry.value?.deleted) {
                current = entry.value;
                print(`[updateGroupMetadata] Found metadata for group ${groupId}`);
                break;
            }
        }

        const updated = { ...current, ...updates };
        await metaBase.append(updated);
        print(`[updateGroupMetadata] Metadata updated for group ${groupId}`);
        return updated;
    } catch (error) {
        print(`[updateGroupMetadata] Failed to update metadata for group ${groupId}: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}

export async function getGroupSummary(groupId, lastSeenTimestamp = 0) {
    try {
        print(`[getGroupSummary] Fetching summary for group ${groupId} with last seen ${lastSeenTimestamp}`);
        const metaBase = await initAutobase(META_GROUP);
        let metadata = null;

        const stream = metaBase.view.createReadStream();
        print(`[getGroupSummary] Created read stream for group summary of ${groupId}`);
        for await (const entry of stream) {
            if (entry.value?.groupId === groupId && !entry.value?.deleted) {
                metadata = entry.value;
                print(`[getGroupSummary] Found metadata for group ${groupId}`);
                break;
            }
        }

        if (!metadata) {
            print(`[getGroupSummary] Group ${groupId} not found`);
            return null;
        }

        const base = await initAutobase(groupId);
        let unreadCount = 0;

        if (lastSeenTimestamp) {
            const stream = base.view.createReadStream({ limit: 100, reverse: true });
            print(`[getGroupSummary] Created read stream for unread count of group ${groupId}`);
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
        print(`[getGroupSummary] Fetched summary for group ${groupId} with ${unreadCount} unread messages`);
        return result;
    } catch (error) {
        print(`[getGroupSummary] Failed to fetch summary for group ${groupId}: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}

export async function getAllGroupSummaries(lastSeenMap = {}) {
    try {
        print('[getAllGroupSummaries] Fetching all group summaries');
        const metaBase = await initAutobase(META_GROUP);
        const summaries = [];

        const stream = metaBase.view.createReadStream();
        print('[getAllGroupSummaries] Created read stream for all group summaries');
        for await (const entry of stream) {
            if (entry.value?.groupId && !entry.value?.deleted) {
                const meta = entry.value;
                summaries.push({
                    ...meta,
                    unreadCount: lastSeenMap[meta.groupId]
                        ? meta.latestTimestamp > lastSeenMap[meta.groupId] ? 1 : 0
                        : 0
                });
                print(`[getAllGroupSummaries] Added summary for group ${meta.groupId}`);
            }
        }

        print(`[getAllGroupSummaries] Fetched ${summaries.length} group summaries`);
        return summaries;
    } catch (error) {
        print(`[getAllGroupSummaries] Failed to fetch all group summaries: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}

export async function getAllGroupDetails() {
    try {
        print('[getAllGroupDetails] Fetching all group details');
        const metaBase = await initAutobase(META_GROUP);
        const details = [];

        // const stream = metaBase.view.createReadStream();
        print('[getAllGroupDetails] Created read stream for all group details');
        // for await (const entry of stream) {
        //     if (entry.value?.groupId && !entry.value?.deleted) {
        //         details.push(entry.value);
        //       print( `Added details for group ${entry.value.groupId}`);
        //     }
        // }
        for (let i = 0; i < metaBase.view.length; i++) {
            details.push(await metaBase.view.get(i));
        }

        print(`[getAllGroupDetails] Fetched ${details.length} group details`);
        return details;
    } catch (error) {
        print(`[getAllGroupDetails] Failed to fetch all group details: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}

export async function deleteGroup(groupId) {
    try {
        print(`[deleteGroup] Deleting group ${groupId}`);
        const metaBase = await initAutobase(META_GROUP);
        await metaBase.append({ groupId, deleted: true });
        print(`[deleteGroup] Group ${groupId} deleted successfully`);
    } catch (error) {
        print(`[deleteGroup] Failed to delete group ${groupId}: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}

export async function cleanup() {
    try {
        print('[cleanup] Starting cleanup');
        // Clear the autobase cache
        autobaseCache.clear();
        print('[cleanup] Group meta base closed');
        if (store) {
            await store.close();
            store = null;
            print('[cleanup] Corestore closed');
        }
        if (fs.existsSync(STORAGE_PATH)) {
            fs.rmSync(STORAGE_PATH, { recursive: true, force: true });
            print(`[cleanup] Removed storage directory ${STORAGE_PATH}`);
        }
        print('[cleanup] Cleanup completed');
    } catch (error) {
        print(`[cleanup] Failed to cleanup: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}

export async function closeStore() {
    try {
        print('[closeStore] Starting Closing');
        // Clear the autobase cache
        autobaseCache.clear();

        if (store) {
            await store.close();
            store = null;
            print('[closeStore] Corestore closed');
        }
        print('[closeStore] Closing completed');
    } catch (error) {
        print(`[closeStore] Failed to cleanup: ${error.message}, Stack: ${error.stack}`);
        throw error;
    }
}