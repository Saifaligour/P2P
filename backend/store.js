import Autobase from 'autobase'
import fs from 'bare-fs'
import { join } from 'bare-path'
import { fileURLToPath } from 'bare-url'
import Corestore from 'corestore'

// Constants
const STORAGE_PATH = join(fileURLToPath(Bare.argv[0]), 'autobase-store')
if (!fs.existsSync(STORAGE_PATH)) fs.mkdirSync(STORAGE_PATH, { recursive: true })

const store = new Corestore(STORAGE_PATH)
const baseMap = new Map()
const baseInitPromises = new Map()
const groupMetaCache = new Map() // In-memory cache for performance
const GROUP_META_CORE = 'group-meta'
let groupMetaCore

// Load group metadata core
async function loadGroupMetaCore() {
    if (!groupMetaCore) {
        groupMetaCore = store.get({ name: GROUP_META_CORE, valueEncoding: 'json' })
        await groupMetaCore.ready()

        // Populate cache from stored metadata
        for await (const entry of groupMetaCore.createReadStream()) {
            const meta = entry.value
            groupMetaCache.set(meta.roomId, meta)
        }
    }
}

// 🚀 Init or get Autobase for a group
async function getAutobase(groupId) {
    if (baseMap.has(groupId)) return baseMap.get(groupId)
    if (!baseInitPromises.has(groupId)) {
        baseInitPromises.set(groupId, createAutobase(groupId))
    }
    return baseInitPromises.get(groupId)
}

async function createAutobase(groupId) {
    const core = store.get({ name: `group-${groupId}`, valueEncoding: 'json' })
    await core.ready()

    const base = new Autobase({
        inputs: [core],
        localInput: core,
        valueEncoding: 'json',
    })

    await base.ready()
    baseMap.set(groupId, base)
    return base
}

// ➕ Create a new group
export async function createGroup(group) {
    await loadGroupMetaCore()

    const {
        id,
        roomId,
        name,
        avatar,
        isOnline = false,
        isRead = false,
    } = group

    const metadata = {
        id,
        roomId,
        name,
        avatar,
        isOnline,
        isRead,
        latestMessage: null,
        unreadCount: 0,
        totalMessages: 0,
        latestTimestamp: 0,
    }

    groupMetaCache.set(roomId, metadata)
    await groupMetaCore.append(metadata)
    await getAutobase(roomId)
}

// ✍️ Write message
export async function writeMessage(message) {
    const base = await getAutobase(message.roomId)
    await base.append(message)
}

// 📥 Read all messages
export async function readMessages(groupId) {
    const base = await getAutobase(groupId)
    const messages = []

    for await (const node of base.createReadStream()) {
        messages.push(node.value)
    }

    return messages
}

// 🟢 Get group summary (with unread count and metadata)
export async function getGroupSummary(groupId, lastSeenTimestamp = 0) {
    await loadGroupMetaCore()
    const base = await getAutobase(groupId)
    const metadata = groupMetaCache.get(groupId) || {}

    let latestMessage = null
    let unreadCount = 0
    let totalMessages = base.length
    let latestTimestamp = 0

    for await (const node of base.createReadStream({ limit: 20, reverse: true })) {
        const { text, time } = node.value

        if (!latestMessage) {
            latestMessage = text
            latestTimestamp = time
        }

        if (time > lastSeenTimestamp) {
            unreadCount++
        }
    }

    return {
        ...metadata,
        groupId,
        latestMessage,
        latestTimestamp,
        unreadCount,
        totalMessages,
    }
}

// 📋 Load summaries for all groups and sort by recent
export async function getAllGroupSummaries(groupIds, lastSeenMap = {}) {
    await loadGroupMetaCore()

    const summaries = await Promise.all(
        groupIds.map(groupId =>
            getGroupSummary(groupId, lastSeenMap[groupId] || 0)
        )
    )

    summaries.sort((a, b) => b.latestTimestamp - a.latestTimestamp)
    return summaries
}

// 📦 Optional: Get all group metadata (from cache)
export async function getAllGroupDetails() {
    await loadGroupMetaCore()
    return Array.from(groupMetaCache.values())
} 
