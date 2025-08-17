import b4a from 'b4a';
import crypto from 'hypercore-crypto';
import sodium from 'sodium-universal';

export default class SymmetricCrypto {
    /**
     * @param {Uint8Array} key 32-byte shared secret key
     */
    constructor(key) {
        if (key && key.length !== sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES) {
            throw new Error(`Key must be ${sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES} bytes`);
        }
        this.key = key || b4a.from('0123456789dfjejcdef01235678abcef', 'hex');
    }

    deriveKey(key) {
        const out = b4a.allocUnsafe(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES)
        return crypto.hash([b4a.from('ns:encrypt'), key], out)
    }

    deriveNonce(key, _sessionToken) {
        const sessionToken = _sessionToken || crypto.randomBytes(32);
        const out = b4a.allocUnsafe(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
        return crypto.hash([b4a.from('ns:nonce'), key, sessionToken], out)
    }

    /**
     * Encrypt a plaintext string
     * @param {string} plaintext
     * @returns {string} formatted as 'nonceHex+ciphertextHex'
     */
    encrypt(plaintext) {
        const secret = this.deriveKey(this.key);
        const nonce = this.deriveNonce(this.key);
        const msg = b4a.from(plaintext);
        const ciphertext = b4a.allocUnsafe(msg.length + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES);

        sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
            ciphertext,
            msg,
            nonce, // AAD must not be null
            null,      // nsec must always be null
            nonce,
            secret
        );

        return `${nonce.toString('hex')}+${ciphertext.toString('hex')}`;
    }

    /**
     * Decrypt a string formatted as 'nonceHex+ciphertextHex'
     * @param {string} data
     * @returns {string} plaintext
     */
    decrypt(data) {
        const [nonceHex, ciphertextHex] = data.split('+');
        const nonce = b4a.from(nonceHex, 'hex');
        const ciphertext = b4a.from(ciphertextHex, 'hex');
        const secret = this.deriveKey(this.key);
        const output = b4a.allocUnsafe(ciphertext.length - sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES);
        sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
            output,
            null,       // nsec must always be null
            ciphertext,
            nonce,  // AAD must not be null
            nonce,
            secret
        );

        return output.toString();
    }

    /**
     * Encrypt a JSON object
     * @param {Object} obj
     * @returns {string} formatted as 'nonceHex+ciphertextHex'
     */
    encryptObject(obj) {
        return this.encrypt(JSON.stringify(obj));
    }

    /**
     * Decrypt a JSON object
     * @param {string} data
     * @returns {Object} decrypted object
     */
    decryptObject(data) {
        const plaintext = this.decrypt(data);
        return JSON.parse(plaintext);
    }
}


// working code takre refromce from it and just use sahred key 
// function deriveKey(publicKey) {
//     const out = b4a.allocUnsafe(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES)
//     return crypto.hash([b4a.from('ns:encrypt'), publicKey], out)
// }

// function deriveNonce(publicKey, _sessionToken) {
//     const sessionToken = _sessionToken || crypto.randomBytes(32);
//     const out = b4a.allocUnsafe(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
//     return crypto.hash([b4a.from('ns:nonce'), publicKey, sessionToken], out);
// }

// function encrypt(data, nonce, secretKey) {
//     const output = b4a.allocUnsafe(
//         data.byteLength + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES
//     )
//     sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
//         output,
//         data,
//         nonce,   // treat nonce as AAD too
//         null,
//         nonce,
//         secretKey
//     )
//     return output
// }

// function decrypt(data, nonce, secretKey) {
//     const output = b4a.allocUnsafe(
//         data.byteLength - sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES
//     )
//     sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
//         output,
//         null,
//         data,
//         nonce,
//         nonce,
//         secretKey
//     )
//     return output
// }
// // --- End copied functions ---


// // ===== Example usage =====

// export const start = () => {
//     console.log('Starting crypto module...');
//     // Step 1. Generate a key pair
//     const { publicKey, secretKey } = crypto.keyPair()

//     // Step 2. Create a session token (random or derived)
//     const sessionToken = crypto.randomBytes(32)

//     // Step 3. Derive a shared secret + nonce
//     const secret = deriveKey(publicKey)
//     const nonce = deriveNonce(publicKey, sessionToken)
//     console.log('Session token:', sessionToken.toString('hex'))
//     console.log('Public key:', publicKey.toString('hex'))
//     console.log('Derived secret:', secret.toString('hex'))
//     console.log('Derived nonce:', nonce.toString('hex'))
//     // Step 4. Encrypt some data
//     const message = b4a.from('Hello peer-to-peer world!')
//     const encrypted = encrypt(message, nonce, secret)
//     console.log('Encrypted:', encrypted.toString('hex'))

//     // Step 5. Decrypt the same data
//     const decrypted = decrypt(encrypted, nonce, secret)
//     console.log('Decrypted:', decrypted.toString())

// }