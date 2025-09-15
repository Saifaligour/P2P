
import { Node } from 'hyperbee/lib/messages';
import sodium from 'sodium-universal';
import { PUBLICK_KEY, SECRET_KEY } from '../../constants/config.mjs';

export function keyPair(seed) {
    // console.log(PUBLICK_KEY.toString('hex'), SECRET_KEY.toString('hex'));
    if (seed) sodium.crypto_sign_seed_keypair(PUBLICK_KEY, SECRET_KEY, seed)
    else sodium.crypto_sign_keypair(PUBLICK_KEY, SECRET_KEY)
    return {
        publicKey: PUBLICK_KEY,
        secretKey: SECRET_KEY
    }

}

export const decode = (data) => {
    const { key, value } = Node.decode(data);
    return { key: key.toString(), value: JSON.parse(value.toString()) };
}

export function wait(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Map_W extends Map {
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

class Set_W extends Set {
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