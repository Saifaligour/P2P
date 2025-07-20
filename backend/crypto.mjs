import b4a from 'b4a';
import { createHash } from 'bare-crypto';

// Your existing key and IV (converted to bare-crypto compatible format)
const key = b4a.from('09b09fdccd61485f8b8ceb676d2085740a0d64bbf6192c62cc3b52fcd7f16ae0', 'hex');
const iv = b4a.from('d344a34a94da7304312620807371cd2e', 'hex');

// 🔒 Encrypt function
export function encryptData(text) {
    const cipher = new crypto.Cipheriv('aes-256-cbc', key, iv);
    const encrypted = b4a.concat([
        cipher.update(b4a.from(text, 'utf8')),
        cipher.final()
    ]);
    return b4a.toString(encrypted, 'hex');
}

// 🔓 Decrypt function
export function decryptData(encryptedData) {
    const decipher = new crypto.Decipheriv('aes-256-cbc', key, iv);
    const decrypted = b4a.concat([
        decipher.update(b4a.from(encryptedData, 'hex')),
        decipher.final()
    ]);
    return b4a.toString(decrypted, 'utf8');
}
// 📦 Method: Generate RSA Key Pair
async function generateKeyPair() {
    // In bare-crypto, we use subtle.generateKey for RSA
    const keyPair = await crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
            hash: 'SHA-256'
        },
        true, // extractable
        ['encrypt', 'decrypt']
    );

    return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey
    };
}

// 2️⃣ Encrypt with Public Key
export async function encryptWithPublicKey(publicKey, plainText) {
    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP'
        },
        publicKey,
        b4a.from(plainText, 'utf8')
    );
    return b4a.toString(encrypted, 'base64');
}

// 3️⃣ Decrypt with Private Key
export async function decryptWithPrivateKey(privateKey, encryptedData) {
    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'RSA-OAEP'
        },
        privateKey,
        b4a.from(encryptedData, 'base64')
    );
    return b4a.toString(decrypted, 'utf8');
}

/**
 * Creates a 32-byte HMAC-SHA-256 hash
 * @param {string|Buffer} input - The data to hash
 * @param {string|Buffer} secretKey - The secret key for HMAC
 * @returns {string} Hex-encoded 32-byte hash
 */
export const generateHash = (input, algorithm = 'SHA256') => {

    // Create hash
    const buffer = createHash(algorithm).update(input).digest()
    // Return as Uint8Array (32 bytes for SHA256)
    return {
        buffer,
        topic: input,
        hash: b4a.toString(buffer, 'hex')
    }
}