/** @typedef {import('pear-interface')} */ /* global Pear */

import b4a from 'b4a';
import {
  CREATE_GROUP, CREATE_INVITE, FETCH_GROUP_DETAILS, FETCH_USER_DETAILS,
  JOIN_GROUP, READ_MESSAGE_FROM_STORE, REGISTER_USER, SEND_MESSAGE
} from '../constants/command.mjs';
import { CONFIG, parseArgs } from '../constants/config.mjs';
import { GROUP_INFO, GROUP_STORE, USER_INFO, USER_STORE } from '../constants/index.mjs';
import RPCManager from './IPC.mjs';
import Autobase from './src/autobase.mjs';
import Crypto from './src/crypto.mjs';
import { keyPair } from './src/helper.mjs';
import NetworkManager from './src/NetworkManager.mjs';
import Store from './src/store.mjs';
class App {
  constructor() {
    this.keyPair = null;
    this.networkManager = null;
    this.args = parseArgs();
    this.bases = new Map();
    this.RPC = RPCManager.getInstance();
    this.storeManager = new Store(this.RPC);
    this.groups = [];
    this._registered = false;
    this.crypto = new Crypto();
    this.log('constructor', 'App initialized with args', this.args);
  }

  /** --- Store Helpers --- */
  async getGroupStore() {
    this.log('getGroupStore', 'Fetching group store');
    return this.storeManager.getStore(GROUP_STORE);
  }

  async getUserStore() {
    this.log('getUserStore', 'Fetching user store');
    return this.storeManager.getStore(USER_STORE);
  }

  async start() {
    this.log('start', 'Starting app...');
    try {
      await this.getGroupStore();
      await this.initDB(GROUP_INFO);
      this.initKeyPair();
      this.registerRPC();

      if (typeof Pear !== 'undefined') {
        this.log('start', 'Registering Pear teardown');
        Pear.teardown(async () => {
          this.log('teardown', 'Tearing down app');
          const store = await this.getGroupStore();
          store.db.close();
          this.networkManager.destroy();
          this.bases.clear();
        });
      }

      this.log('start', 'App started successfully');
    } catch (error) {
      this.log('start', 'Failed to initialize app', error);
      throw error;
    }
  }

  initKeyPair() {
    this.keyPair = keyPair();
    this.log('initKeyPair', 'Generated keyPair', {
      publicKey: this.keyPair.publicKey.toString('hex')
    });
  }

  async initDB(name) {
    this.log('initDB', `Initializing DB for ${name}`);
    try {
      await this.storeManager.initDB(name);
      await this.setupNetworkManager();
      this.groups = await this.storeManager.fetchGroups();
      this.log('initDB', `Fetched ${this.groups.length} groups`);
      await Promise.all(this.groups.map(g => this.loadGroup(g)));
      this.log('initDB', 'DB initialized successfully');
    } catch (error) {
      this.log('initDB', 'Failed to initialize DB', error);
    }
  }

  async loadGroup(group) {
    this.log('loadGroup', `Loading group: ${group.groupId}`);
    if (this.bases.has(group.groupId)) {
      this.log('loadGroup', `Group ${group.groupId} already loaded`);
      return;
    }
    try {
      const base = await this.loadBase(group.baseKey);
      this.registerBaseEvents(base, group.groupId);
      this.bases.set(group.groupId, base);
      this.networkManager.join(base.discoveryKey);
      this.log('loadGroup', `Group ${group.groupId} loaded successfully`);
    } catch (error) {
      this.log('loadGroup', `Failed to load group ${group.groupId}`, error);
    }
  }

  async loadBase(baseKey) {
    this.log('loadBase', `Loading base with key: ${b4a.toString(baseKey, 'hex')}`);
    const store = await this.getGroupStore();
    const namespace = store.namespace(baseKey);
    const base = new Autobase(namespace, baseKey);
    await base.ready();
    this.log('loadBase', 'Base ready');
    return base;
  }

  registerBaseEvents(base, groupId) {
    this.log('registerBaseEvents', `Registering events for group ${groupId}`);
    base.on('member-add', (key) => this.handleMemberAdd(key, groupId));
    base.on('update', () => this.newMessageFromPeer(groupId));
  }

  async setupNetworkManager() {
    this.log('setupNetworkManager', 'Setting up network manager');
    try {
      const store = await this.getUserStore();
      this.networkManager = new NetworkManager(this.bases, store, {
        verbose: CONFIG.VERBOSE_LOGGING,
        keyPair: this.keyPair,
        onPeerCountChange: (count, groupId) => {
          this.log('setupNetworkManager', `Peer count changed for group ${groupId}: ${count}`);
        }
      });
      this.log('setupNetworkManager', 'Network manager ready');
    } catch (error) {
      this.log('setupNetworkManager', 'Failed to set up network manager', error);
    }
  }

  async handleMemberAdd(key, groupId) {
    this.log('handleMemberAdd', `New member added to group: ${groupId}`);
    const base = this.bases.get(groupId);
    if (!base) {
      this.log('handleMemberAdd', `Base not found for group ${groupId}`);
      return;
    }

    if (key.equals(base.local.key)) {
      this.log('handleMemberAdd', `Checking writable state for group ${groupId}`);
      setTimeout(() => {
        if (base.writable) this.handleWritable(groupId);
      }, CONFIG.WRITABLE_CHECK_DELAY || 1000);
    }
  }

  async handleWritable(groupId) {
    this.log('handleWritable', `Base is writable for group ${groupId}`);
  }

  async createInviteHandler({ groupId }) {
    this.log('createInviteHandler', `Creating invite for group ${groupId}`);
    try {
      const base = await this.bases.get(groupId);
      if (!base) throw new Error(`Group not found: ${groupId}`);
      const data = await base.get(groupId);
      this.log('createInviteHandler', `Fetched data for group ${groupId}`, data);
      const invite = this.crypto.encryptObject({
        publicKey: this.keyPair.publicKey.toString('hex'),
        groupId: base.discoveryKey.toString('hex'),
        key: base.key.toString('hex'),
        data: JSON.stringify(data)
      });
      this.log('createInviteHandler', `Invite created for group ${groupId}`);
      return { invite };
    } catch (error) {
      this.log('createInviteHandler', `Error creating invite for group ${groupId}`, error);
      return { error: error.message || 'Failed to create invite' };
    }
  }

  async newMessageFromPeer(groupId) {
    this.log('newMessageFromPeer', `Fetching new messages for group ${groupId}`);
    try {
      const base = this.bases.get(groupId);
      if (!base) {
        this.log('newMessageFromPeer', `Base not found for group ${groupId}`);
        return;
      }

      for await (const { key, value } of base.view.createReadStream({ live: true })) {
        if (key === groupId) continue;
        this.log('newMessageFromPeer', `New message in group ${groupId}`, value);
      }
    } catch (error) {
      this.log('newMessageFromPeer', `Error fetching new message for group ${groupId}`, error);
    }
  }

  async writeMessageHandler(messages) {
    this.log('writeMessageHandler', `Writing message to group ${messages.groupId}`);
    try {
      const base = this.bases.get(messages.groupId);
      if (!base) throw new Error(`Base not found for groupId ${messages.groupId}`);
      await base.append(JSON.stringify(messages));
      this.log('writeMessageHandler', `Message written successfully in group ${messages.groupId}`);
    } catch (error) {
      this.log('writeMessageHandler', 'Failed to write message', error);
    }
  }

  async readMessageHandler({ groupId }) {
    this.log('readMessageHandler', `Reading messages for group ${groupId}`);
    const messages = [];
    try {
      const base = this.bases.get(groupId);
      if (!base) throw new Error(`Group not found: ${groupId}`);
      for await (const { key, value } of base.view.createReadStream()) {
        if (key === groupId) continue; // Skip group metadata
        messages.push(value);
      }
      this.log('readMessageHandler', `Fetched ${messages.length} messages for group ${groupId}`);
    } catch (error) {
      this.log('readMessageHandler', `Failed to read messages for group ${groupId}`, error);
    }
    return messages;
  }

  async registerUserHandler(user) {
    this.log('registerUserHandler', 'Registering user', user);
    try {
      const db = await this.storeManager.initDB(USER_INFO);
      const existsUser = await db.get(USER_INFO);
      const _user = existsUser?.value ? { ...existsUser.value, ...user } : user;
      await db.put(USER_INFO, _user);
      this.log('registerUserHandler', 'User registered successfully');
      return { success: true, status: 200, message: 'User registered successfully' };
    } catch (error) {
      this.log('registerUserHandler', 'Error registering user', error);
      return { success: false, status: 500, message: 'Internal error', error: error.message };
    }
  }

  async userDetailHandler() {
    this.log('userDetailHandler', 'Fetching user details');
    try {
      const db = await this.storeManager.initDB(USER_INFO);
      const user = await db.get(USER_INFO);
      this.log('userDetailHandler', 'User details fetched', user?.value);
      return { success: true, status: 200, message: 'User details fetched', data: user?.value };
    } catch (error) {
      this.log('userDetailHandler', 'Error fetching user details', error);
      return { success: false, status: 500, message: 'Internal error', error: error.message };
    }
  }

  async joinGroupHandler({ invite }) {
    this.log('joinGroupHandler', 'Joining group with invite', invite);
    try {
      const { key, groupId, ...res } = this.crypto.decryptObject(invite);
      console.log('Decrypted invite:', { key, groupId, ...res });
      if (!key || !groupId) throw new Error('Invalid invite format');

      const base = await this.loadBase(b4a.from(key, 'hex'));
      this.registerBaseEvents(base, groupId);

      this.networkManager.join(b4a.from(groupId, 'hex'));
      this.bases.set(groupId, base);
      await this.storeManager.createGroups(res.data);
      this.log('joinGroupHandler', `Joined group successfully: ${groupId}`);
      return { success: true, groupId, data: res.data };
    } catch (error) {
      this.log('joinGroupHandler', 'Failed to join group', error);
      return { error: error.message || 'Failed to join group' };
    }
  }

  async createGroupHandler(metadata) {
    this.log('createGroupHandler', 'Creating group', metadata);
    try {
      const store = await this.getGroupStore();
      const baseKey = await Autobase.getLocalKey(store, { keyPair: this.keyPair, name: metadata.name });
      const base = await this.loadBase(baseKey);
      const groupId = base.discoveryKey.toString('hex');
      this.registerBaseEvents(base, groupId);

      Object.assign(metadata, {
        latestMessage: null,
        unreadCount: 0,
        totalMessages: 0,
        latestTimestamp: 0,
        groupId,
        id: groupId,
        write: true,
        writerKey: base.local.key.toString('hex'),
        baseKey: baseKey.toString('hex')
      });

      await this.storeManager.createGroups(metadata);
      this.networkManager.join(base.discoveryKey);

      if (base.writable) {
        this.log('createGroupHandler', `Base writable immediately for group ${groupId}`);
        await this.handleWritable(groupId);
      } else {
        this.log('createGroupHandler', `Waiting for writable base in group ${groupId}`);
        base.once('writable', () => this.handleWritable(groupId));
      }

      this.bases.set(groupId, base);
      await base.view.ready();
      await base.append(JSON.stringify(metadata));
      this.log('createGroupHandler', `Group created successfully: ${groupId}`);
      return metadata;
    } catch (error) {
      this.log('createGroupHandler', 'Failed to create group', error);
      return { success: false, message: 'Failed to create group', error: error.message };
    }
  }

  async getGroupDetailsHandler() {
    this.log('getGroupDetailsHandler', 'Fetching group details');
    try {
      if (!this.groups?.length) {
        this.log('getGroupDetailsHandler', 'No groups cached, reinitializing DB');
        await this.initDB(GROUP_INFO);
      }
      this.log('getGroupDetailsHandler', `Returning ${this.groups.length} groups`);
      return this.groups;
    } catch (error) {
      this.log('getGroupDetailsHandler', 'Error fetching group details', error);
      return { success: false, message: 'Failed to fetch group details', error: error.message };
    }
  }

  registerRPC() {
    if (this._registered) {
      this.log('registerRPC', 'RPC already registered');
      return;
    }
    this._registered = true;
    this.log('registerRPC', 'Registering RPC handlers');

    this.RPC.onRequest(REGISTER_USER, this.registerUserHandler.bind(this));
    this.RPC.onRequest(FETCH_USER_DETAILS, this.userDetailHandler.bind(this));
    this.RPC.onRequest(FETCH_GROUP_DETAILS, this.getGroupDetailsHandler.bind(this));
    this.RPC.onRequest(CREATE_GROUP, this.createGroupHandler.bind(this));
    this.RPC.onRequest(READ_MESSAGE_FROM_STORE, this.readMessageHandler.bind(this));
    this.RPC.onRequest(SEND_MESSAGE, this.writeMessageHandler.bind(this));
    this.RPC.onRequest(CREATE_INVITE, this.createInviteHandler.bind(this));
    this.RPC.onRequest(JOIN_GROUP, this.joinGroupHandler.bind(this));
  }

  log(method, message, data = null) {
    this.RPC.log('app.mjs', method, 'COMMAND', message, data);
  }
}

const app = new App();
app.start();
