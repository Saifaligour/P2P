/** @typedef {import('pear-interface')} */ /* global Pear */

import Autobase from 'autobase'
import b4a from 'b4a'
import fs from 'bare-fs'
import { join } from 'bare-path'
import { fileURLToPath } from 'bare-url'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import { CREATE_GROUP, FETCH_GROUP_DETAILS, FETCH_USER_DETAILS, REGISTER_USER } from '../constants/command.mjs'
import { GROUP_INFO, GROUP_STORE, USER_INFO, USER_STORE } from '../constants/index.mjs'
import RPCManager from './IPC.mjs'
import NetworkManager from './src/NetworkManager.mjs'
import View from './src/View.mjs'
import { CONFIG, parseArgs } from './src/config.mjs'
import { createInvite, decodeInvite, keyPair } from './src/helper.mjs'

class App {
  constructor() {
    this.db = null;
    this.store = null;
    this.keyPair = null;
    this.networkManager = null;
    this.args = parseArgs();
    this.bases = new Map();
    this.RPC = RPCManager.getInstance();
    this.storeManager = new Store(this.RPC);
    this.groups = []

    this.init()
  }

  async init() {
    this.store = await this.storeManager.getStore(GROUP_STORE);
    this.initKeyPaire()
    this.#register();
    this.setUpnetworkManager()
    this.initDB(GROUP_INFO)

    if (typeof Pear !== 'undefined') {
      Pear.teardown(() => {
        // this.store.baseStore()
        this.store.db.close()
        this.networkManager.destroy()
        this.bases.clear()
      })
    }
  }

  initKeyPaire() {
    // this.seed = '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29'
    this.keyPair = keyPair()
    console.log('publick Kye :', this.keyPair.publicKey.toString('hex'));

  }

  async initDB(name) {
    await this.storeManager.initDB(name)
    this.groups = await this.storeManager.fetchGroups()
    this.groups.forEach(g => this.createGroup(g.groupName, g.baseKey, g.isAdmin, true))
  }
  /**
   * Create a new group (Autobase)
   */
  async createGroup(groupId, autobaseKey, isAdmin, existingGroup, metadata = {}) {
    const groupName = groupId;
    let base
    if (this.bases.has(groupId)) {
      base = this.bases.get(groupId)
    }
    else {
      if (!isAdmin)
        autobaseKey = existingGroup ? autobaseKey : decodeInvite(autobaseKey)
      const baseKey = (!isAdmin && autobaseKey) ? b4a.from(autobaseKey, 'hex') : (await Autobase.getLocalKey(this.store, { keyPair: this.keyPair, name: groupId }))
      console.log(autobaseKey ? `Joined group by key ${baseKey.toString('hex')}` : `Create new base key ${baseKey.toString('hex')}`);

      base = new Autobase(
        this.store.namespace(baseKey),
        baseKey,
        new View(CONFIG.VERBOSE_LOGGING)
      )

      await base.ready()
      groupId = base.discoveryKey.toString('hex')
      this.bases.set(groupId, base)
      const writerKey = base.local.key.toString('hex')
      // Add group UI container
      console.log('Base Autobase key', baseKey.toString('hex'));
      console.log('Base base.key', base.key.toString('hex'));
      console.log('Base base.local.key', writerKey);
      console.log('Base base.discoveryKey', groupId);
      if (!existingGroup)
        this.storeManager.createGroups({ isAdmin, discoveryKey: groupId, groupName, writerKey, name: this.args.name, baseKey: baseKey.toString('hex'), ...metadata })
      // this.uiManager.addGroupToList(groupId, writerKey, groupName)
      this.networkManager.join(base.discoveryKey)

    }
    // this.uiManager.resetMessage()
    // Attach Autobase events
    base.on('member-add', (key) => this.handleMemberAdd(base, key, groupId))
    base.on('update', () => this.loadExistingMessages(base, groupId))

    // Writable state
    if (base.writable) {
      await this.handleWritable(groupId)
    } else {
      base.once('writable', () => this.handleWritable(groupId))
    }

    // Load existing messages
    setTimeout(() => this.loadExistingMessages(base, groupId), CONFIG.MESSAGE_LOAD_DELAY)
  }

  setUpnetworkManager() {
    // Shared NetworkManager
    this.networkManager = new NetworkManager(this.bases, this.db, {
      verbose: CONFIG.VERBOSE_LOGGING,
      keyPair: this.keyPair,
      onPeerCountChange: (count, groupId) => {
        console.log(`Peer count changed for group ${groupId}: ${count}`);

        // this.uiManager.updateGroupPeerCount(groupId, count)
      }
    })

  }

  async handleMemberAdd(base, key, groupId) {
    console.log('New member added to group')
    if (key.equals(base.local.key)) {
      setTimeout(() => {
        if (base.writable) this.handleWritable(groupId)
      }, CONFIG.WRITABLE_CHECK_DELAY)
    }
  }

  async handleWritable(groupId) {
    // this.uiManager.setWritable(groupId, true)
  }

  async sendMessage(groupId, messageData) {
    const base = this.bases.get(groupId)
    if (base) await base.append(JSON.stringify(messageData))
  }

  async loadExistingMessages(base, groupId) {
    await base.view.ready()
    await base.view.update()

    for await (const { seq, value } of base.view.createReadStream({ live: true })) {
      if (value.echo && value.echo.message) {
        // this.uiManager.displayMessage(groupId, value.echo, seq)
        console.log('Message:', value.echo.message);
      } else if (value.echo && value.echo.add) {
        // this.uiManager.addSystemMessage(groupId, { add: value.echo.add }, seq)
        console.log('System Message:', value.echo.add);
      }
    }
  }

  async createInvite(groupId) {
    const base = this.bases.get(groupId)
    if (!base) throw new Error('Group not found')

    const invite = createInvite({
      seed: this.keyPair.publicKey,
      discoveryKey: base.discoveryKey,
      key: base.key
    })
    return invite
  }


  // RPC handlers
  async registerUserHandler(user) {
    this.#log('registerUser', 'Reg`istering user', user);

    try {
      await this.storeManager.initDB(USER_INFO)
      const existsUser = await this.storeManager.db.get(USER_INFO);
      const _user = existsUser?.value ? { ...existsUser?.value, ...user } : user;
      await this.storeManager.db.put(USER_INFO, _user);
      return { success: true, status: 200, message: 'User registered successfully' };
    } catch (error) {
      this.#log('registerUser', 'Error registering user', error);
      return { success: false, status: 500, message: 'Internal error', error: error.message };
    }
  }

  async userDetailHandler() {
    this.#log('userDetail', 'Fetching user details');

    try {
      await this.storeManager.initDB(USER_INFO)
      const user = await this.storeManager.db.get(USER_INFO);
      return { success: true, status: 200, message: 'User details fetched', data: user.value };
    } catch (error) {
      this.#log('userDetail', 'Error fetching user details', error);
      return { success: false, status: 500, message: 'Internal error', error: error.message };
    }
  }

  async createGroupHandler(group) {
    try {
      const { groupId } = group;
      const metadata = {
        ...group,
        latestMessage: null,
        unreadCount: 0,
        totalMessages: 0,
        latestTimestamp: 0,
      };
      this.createGroup(groupId, undefined, true, false, metadata);
      return metadata;
    } catch (error) {
      this.#log('createGroup', 'Failed to create group', error);
      return { success: false, message: 'Failed to create group', error: error.message };
    }
  }

  async writeMessagesToStore(messages, from) {
    // if (!messages.length) return [];

    // const groupId = messages[0].groupId;
    // const db = await this.store.autoBase(groupId);
    // const results = [];

    // for (const msg of messages) {
    //   msg.sender = from === 'peer' ? 'other' : 'me';
    //   const seq = await db.put(msg.id, msg);
    //   results.push(seq);
    // }

    // return results;
  }

  async readMessagesFromStore({ groupId, limit = 100, reverse = false }) {
    // const db = await this.store.autoBase(groupId);
    const messages = [];

    try {
      // const snapshot = db.snapshot();
      // for await (const entry of snapshot.createReadStream({ limit, reverse })) {
      //   messages.push(entry.value);
      // }
      // await snapshot.close();
    } catch (err) {
      this.#log('readMessagesFromStore', 'Error reading messages', err);
    }

    return reverse ? messages : messages.reverse();
  }

  async getGroupDetailsHandler() {
    try {
      if (this.groups && this.groups.length > 0) {
        return this.groups;
      }
      else {
        this.initDB(GROUP_INFO);
        return this.groups;
      }
    } catch (err) {
      this.#log('getGroupDetailsHandler', 'Error fetching group details', err);
      return { success: false, message: 'Failed to fetch group details', error: err.message };
    }
  }

  #register() {
    if (this._registered) return;
    this._registered = true;

    this.RPC.onRequest(REGISTER_USER, this.registerUserHandler.bind(this));
    this.RPC.onRequest(FETCH_USER_DETAILS, this.userDetailHandler.bind(this));
    this.RPC.onRequest(FETCH_GROUP_DETAILS, this.getGroupDetailsHandler.bind(this));
    this.RPC.onRequest(CREATE_GROUP, this.createGroupHandler.bind(this));
  }

  #log(method, message, dataOrError = null) {
    this.RPC.log('store.js', method, null, message, dataOrError);
  }
}




class Store {
  db = null;
  store = new Map()

  constructor(RPC) {
    this.store = new Map()
    this.RPC = RPC
  }

  async getStore(path) {
    if (this.store.has(path)) {
      return this.store.get(path);
    } else {
      const STORAGE_PATH = this.getPath(path)
      try {
        this.#log('initStore', `Initializing Corestore at ${STORAGE_PATH}`);
        const store = new Corestore(STORAGE_PATH);
        await store.ready();
        this.#log('initStore', `Corestore initialized successfully`);
        this.store.set(path, store);
        return store
      } catch (error) {
        this.#log('initStore', 'Failed to initialize Corestore', error);
        if (error.message.includes('No locks available')) {
          const lockFile = join(STORAGE_PATH, 'db', 'LOCK');
          if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
            this.#log('initStore', 'Lock file removed. Retrying Corestore initialization.');
            const store = new Corestore(STORAGE_PATH);
            await store.ready();
            this.#log('initStore', 'Corestore initialized after clearing lock');
            this.store.set(path, store);
            return store;
          } else {
            throw new Error(`Lock file not found, but lock error persists`);
          }
        } else {
          throw error;
        }
      }

    }
  }

  getPath(path) {
    const [_path, platform, env] = Bare?.argv;
    const ENV = JSON.parse(env) || { dev: true };
    const __dirname = ENV.dev && platform === 'ios' ? fileURLToPath(`file:///Volumes/Home/practice/P2P/P2P/db`) : fileURLToPath(path);
    const PATH = join(__dirname, path);
    console.log('Store Path', PATH);
    return PATH
  }

  #log(method, message, dataOrError = null) {
    this.RPC.log('store.js', method, null, message, dataOrError);
  }

  async initDB(name) {
    const db_store = await this.getStore(USER_STORE);
    const db_core = db_store.get({ name })
    await db_core.ready()
    this.db = new Hyperbee(db_core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
    await this.db.ready()
  }

  async createGroups(groups) {
    await this.initDB(GROUP_INFO)
    const existingGroup = await this.db.get(groups.groupName)
    if (existingGroup) {
      console.log('This group is alredy created ');
      return
    }
    this.db.put(groups.groupName, JSON.stringify(groups))
    console.log('create new group')
  }

  async fetchGroups() {
    await this.initDB(GROUP_INFO)
    await this.db.update()
    const groups = [];
    for await (const { seq, value } of this.db.createReadStream()) {
      console.log(`Fetched group ${seq}:`, value);
      groups.push(JSON.parse(value))
    }
    return groups
  }

  async addPeerToGroup(pubkey, groupId) {
    await this.db.batch([
      { type: 'put', key: `peer/${pubkey}/group/${groupId}`, value: '' },
      { type: 'put', key: `group/${groupId}/peer/${pubkey}`, value: '' }
    ])
  }

  async removePeerFromGroup(pubkey, groupId) {
    await this.db.batch([
      { type: 'del', key: `peer/${pubkey}/group/${groupId}` },
      { type: 'del', key: `group/${groupId}/peer/${pubkey}` }
    ])
  }

  async listGroupsForPeer(pubkey) {
    const groups = []
    for await (const { key } of this.db.createReadStream({
      gte: `peer/${pubkey}/group/`,
      lt: `peer/${pubkey}/group0`
    })) {
      groups.push(key.split('/')[3])
    }
    return groups
  }

  async listPeersInGroup(groupId) {
    const peers = []
    for await (const { key } of this.db.createReadStream({
      gte: `group/${groupId}/peer/`,
      lt: `group/${groupId}/peer0`
    })) {
      peers.push(key.split('/')[3])
    }
    return peers
  }

  async isPeerInGroup(pubkey, groupId) {
    const entry = await this.db.get(`group/${groupId}/peer/${pubkey}`)
    return !!entry
  }

}

const app = new App()
