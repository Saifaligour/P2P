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

// 🟢 Get group summary (with unread count)
export async function getGroupSummary(groupId, lastSeenTimestamp = 0) {
    const base = await getAutobase(groupId)

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
        groupId,
        latestMessage,
        latestTimestamp,
        unreadCount,
        totalMessages,
    }
}

// 📋 Load summaries for all groups and sort by recent
export async function getAllGroupSummaries(groupIds, lastSeenMap = {}) {
    const summaries = await Promise.all(
        groupIds.map(groupId =>
            getGroupSummary(groupId, lastSeenMap[groupId] || 0)
        )
    )

    // Sort by timestamp (latest activity)
    summaries.sort((a, b) => b.latestTimestamp - a.latestTimestamp)

    return summaries
}
