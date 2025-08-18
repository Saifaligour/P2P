/** @typedef {import('pear-interface')} */ /* global Pear */

import fs from 'bare-fs'
import { join } from 'bare-path'
import { fileURLToPath } from 'bare-url'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import { CONFIG } from '../../constants/config.mjs'
import { GROUP_INFO, USER_STORE } from '../../constants/index.mjs'

class Store {
    constructor(RPC) {
        this.RPC = RPC
        this.coreStores = new Map() // Corestore per path
        this.dbs = new Map()        // Hyperbee per DB name
        this.basePath = null        // Cached _dirname
        this.#log('constructor', 'Store initialized')
    }

    // Get Corestore instance
    async getStore(path) {
        this.#log('getStore', `Fetching store for path: ${path}`)

        if (this.coreStores.has(path)) {
            this.#log('getStore', `Reusing existing store for path: ${path}`)
            return this.coreStores.get(path)
        }

        const STORAGE_PATH = this.getPath(path)
        this.#log('getStore', `Resolved storage path: ${STORAGE_PATH}`)

        try {
            const store = new Corestore(STORAGE_PATH)
            await store.ready()
            this.coreStores.set(path, store)
            this.#log('getStore', `Corestore ready for path: ${path}`)
            return store
        } catch (err) {
            this.#log('getStore', `Error opening Corestore at ${STORAGE_PATH}`, err)

            // Handle lock cleanup
            if (err.message.includes('No locks available')) {
                const lockFile = join(STORAGE_PATH, 'db', 'LOCK')
                this.#log('getStore', `Lock issue detected, removing lock file: ${lockFile}`)
                if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile)

                const store = new Corestore(STORAGE_PATH)
                await store.ready()
                this.coreStores.set(path, store)
                this.#log('getStore', `Recovered Corestore after lock removal for path: ${path}`)
                return store
            }
            throw err
        }
    }

    // Compute storage path once
    getPath(path) {
        if (!this.basePath) {
            // eslint-disable-next-line no-undef
            const [_path, platform, env] = Bare?.argv || []
            const ENV = JSON.parse(env || '{}') || { dev: true }

            this.basePath =
                ENV.dev && platform === 'ios'
                    ? fileURLToPath(CONFIG.BASE_PATH)
                    : fileURLToPath(_path || './db')

            this.#log('getPath', `Base path resolved: ${this.basePath}`, ENV)
        }

        const fullPath = join(this.basePath, path)
        this.#log('getPath', `Final computed path: ${fullPath}`)
        return fullPath
    }

    // Optional logging
    #log(method, message, dataOrError = null) {
        if (CONFIG.VERBOSE_LOGGING) {
            this.RPC.log('store.mjs', method, null, message, dataOrError)
        }
    }

    // Initialize Hyperbee DB
    async initDB(name) {
        this.#log('initDB', `Initializing DB: ${name}`)

        if (this.dbs.has(name)) {
            this.#log('initDB', `Reusing existing DB: ${name}`)
            return this.dbs.get(name)
        }

        const store = await this.getStore(USER_STORE)
        const core = store.get({ name })
        await core.ready()
        this.#log('initDB', `Core ready for DB: ${name}`)

        const db = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
        await db.ready()
        this.dbs.set(name, db)

        this.#log('initDB', `DB ready: ${name}`)
        return db
    }

    // Create a group if it doesn't exist
    async createGroups(group) {
        this.#log('createGroups', `Creating group: ${group.groupId}`)
        const db = await this.initDB(GROUP_INFO)
        const exists = await db.get(group.groupId)

        if (!exists) {
            await db.put(group.groupId, group)
            this.#log('createGroups', `Group created successfully: ${group.groupId}`, group)
        } else {
            this.#log('createGroups', `Group already exists: ${group.groupId}`)
        }
    }

    async updateGroupMetaData(groupId, metaData) {
        this.#log('updateGroupMetaData', `Updating metadata for group ${groupId}`, metaData)
        const db = await this.initDB(GROUP_INFO)
        const { value } = await db.get(groupId)
        value.message = metaData.message;
        db.put(groupId, value)
        this.#log('updateGroupMetaData', `Metadata updated for group ${groupId}`)
    }

    // Fetch all groups (cold load only)
    async fetchGroups() {
        this.#log('fetchGroups', 'Fetching all groups')
        const db = await this.initDB(GROUP_INFO)
        const groups = []

        for await (const { value } of db.createReadStream()) {
            groups.push(value)
        }

        this.#log('fetchGroups', `Fetched ${groups.length} groups`, groups)
        return groups
    }

    async getGroupDetails(groupId) {
        this.#log('getGroupDetails', `Fetching group: ${groupId}`)
        const db = await this.initDB(GROUP_INFO)
        const { value } = await db.get(groupId)
        this.#log('getGroupDetails', `Fetched group: ${groupId}`, value)
        return value
    }
}

export default Store
