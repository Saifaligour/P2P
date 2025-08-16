
import b4a from 'b4a';
import c from 'compact-encoding';
import sodium from 'sodium-universal';
import z32 from 'z32';
import { CONFIG, PUBLICK_KEY, SECRET_KEY } from './config.mjs';

export function keyPair(seed) {
    // console.log(PUBLICK_KEY.toString('hex'), SECRET_KEY.toString('hex'));
    if (seed) sodium.crypto_sign_seed_keypair(PUBLICK_KEY, SECRET_KEY, seed)
    else sodium.crypto_sign_keypair(PUBLICK_KEY, SECRET_KEY)
    return {
        publicKey: PUBLICK_KEY,
        secretKey: SECRET_KEY
    }

}

export function encrypt(data, nonce, secretKey) {
    const output = b4a.allocUnsafe(data.byteLength + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES)
    sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(output, data, nonce, null, nonce, secretKey)
    return output
}

export function decrypt(data, nonce, secretKey) {
    const output = b4a.allocUnsafe(data.byteLength - sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES)
    sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(output, null, data, nonce, nonce, secretKey)
    return output
}

const Invite = {
    preencode(state, i) {
        state.end++ // version
        state.end++ // flags
        c.fixed32.preencode(state, i.seed)
        if (i.key) c.fixed32.preencode(state, i.key)
        if (i.discoveryKey) c.fixed32.preencode(state, i.discoveryKey)
        if (i.expires) c.uint32.preencode(state, Math.floor(i.expires / 1000)) // store as secs
        if (i.data) c.string.preencode(state, i.data);
    },
    encode(state, i) {
        c.uint.encode(state, 1) // version
        c.uint.encode(state, (i.discoveryKey ? 1 : 0) | (i.expires ? 2 : 0) | (i.sensitive ? 4 : 0) | (i.testInvitation ? 8 : 0))
        c.fixed32.encode(state, i.seed)
        if (i.key) c.fixed32.encode(state, i.key)
        if (i.discoveryKey) c.fixed32.encode(state, i.discoveryKey)
        if (i.expires) c.uint32.encode(state, Math.floor(i.expires / 1000))
        if (i.data) c.string.encode(state, i.data);
    },
    decode(state) {
        const version = c.uint.decode(state)
        if (version !== 1) {
            throw new Error('Unknown invite version')
        }

        const flags = c.uint.decode(state)

        const seed = c.fixed32.decode(state);
        const key = c.fixed32.decode(state);
        const discoveryKey = (flags & 1) ? c.fixed32.decode(state) : null;
        const expires = (flags & 2) ? c.uint32.decode(state) * 1000 : 0;
        const sensitive = (flags & 4) !== 0;
        const testInvitation = (flags & 8) !== 0;
        let data = c.string.decode(state);
        return {
            seed,
            key,
            discoveryKey,
            expires,
            sensitive,
            testInvitation,
            data
        }
    }
}

export function createInvite(opts = {}) {
    const {
        data = '{}',
        discoveryKey,
        sensitive = false,
        testInvitation = false,
        key,
        seed = crypto.randomBytes(32),
        expires = Date.now() + CONFIG.INVITE_EXPIRY_MS,
    } = opts

    const inviteObj = { seed, discoveryKey, key, expires, sensitive, testInvitation, data };
    const encoded = z32.encode(c.encode(Invite, inviteObj));
    console.log('Encoded invite:', encoded, 'with data:', data);
    return encoded
}

export function decodeInvite(invite) {
    const decodedInvite = z32.decode(invite)
    const decoded = c.decode(Invite, decodedInvite)
    console.log('Decoded invite:', decoded);
    return decoded
}


class WatchedMap extends Map {
    constructor() {
        super();
        this._onAdd = () => { };
    }

    /**
     * Register your “new-key” callback.
     * @param {(key: any, value: any) => void} fn
     */
    watch(fn) {
        this._onAdd = fn;
        return this;
    }

    set(key, value) {
        const isNew = !this.has(key);
        super.set(key, value);
        if (isNew) this._onAdd(key, value);
        return this;
    }
}

class WatchedSet extends Set {
    constructor() {
        super();
        this._onAdd = () => { };
    }

    /**
     * Register a callback that fires when a value is handled
     * @param {(value: any) => void} fn
     */
    watch(fn) {
        this._onAdd = fn;
        return this;
    }

    /**
     * Add a value to the set.
     * Always calls _onAdd, optionally skips adding to set.
     * @param {any} value 
     * @param {boolean} existing - if true, value already exists; skip Set.add
     */
    add(value, existing = false) {
        if (!existing) super.add(value); // Only add if not existing
        this._onAdd(value);              // Always trigger callback
        return this;
    }
}