import b4a from 'b4a'; // Module for buffer-to-string and vice-versa conversions 
import crypto from 'crypto';
import fs from 'fs';

// Generate a 32-byte (256-bit) secret key and a 16-byte IV
// const key = crypto.createHash('sha256').update('your-encryption-key').digest(); // 32 bytes for AES-256
// const iv = crypto.createHash('md5').update('your-encryption-iv').digest(); // 16 bytes for AES-CBC
// console.log(b4a.toString(key, 'hex'), ',', b4a.toString(iv, 'hex'));
const key = b4a.from('09b09fdccd61485f8b8ceb676d2085740a0d64bbf6192c62cc3b52fcd7f16ae0', 'hex');
const iv = b4a.from('d344a34a94da7304312620807371cd2e', 'hex')
// 🔒 Encrypt function
export function encryptData(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // console.log('encrypted message:', encrypted);
    return encrypted

}

// 🔓 Decrypt function
export function decryptData(encryptedData) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}



// 📦 Method: Generate RSA Key Pair and Save to Files
function generateKeyPair() {
    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    let publicKey = fs.readFileSync('./public.pem', 'utf8');
    if (!privateKey || !publicKey) {
        const keyPairs = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048, // Key size in bits (2048 is standard)
            publicKeyEncoding: {
                type: 'pkcs1',      // Format type
                format: 'pem'       // Output format: PEM string
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        });
        privateKey = keyPairs.privateKey;
        publicKey = keyPairs.publicKey;
        // Save keys to disk (optional)
        fs.writeFileSync('public.pem', publicKey);
        fs.writeFileSync('private.pem', privateKey);
    }

    // Return keys as strings
    return { publicKey, privateKey };
}

// ✅ Example usage
const { publicKey, privateKey } = generateKeyPair();
// console.log('Public Key:\n', publicKey);
// console.log('Private Key:\n', privateKey);


// 2️⃣ Encrypt with Public Key
export function encryptWithPublicKey(plainText) {
    const encryptedBuffer = crypto.publicEncrypt(publicKey, Buffer.from(plainText));
    const encryptData = encryptedBuffer.toString('base64');
    // console.log('encrypted message:', encryptData);
    return encryptData;
}

// 3️⃣ Decrypt with Private Key
export function decryptWithPrivateKey(encryptedData) {
    const decryptedBuffer = crypto.privateDecrypt(privateKey, Buffer.from(encryptedData, 'base64'));
    return decryptedBuffer.toString('utf8');
}

// ✅ Example usage
// const message = 'Hello Saif!';
// const encrypted = encryptWithPublicKey(message);
// console.log('Encrypted:', encrypted);

// const decrypted = decryptWithPrivateKey(encrypted);
// console.log('Decrypted:', decrypted);

// ✅ Example usage
// const plainText = 'Hello Saif!';
// const encrypted = encryptData(plainText);
// console.log('Encrypted:', encrypted);

// const decrypted = decryptData(encrypted);
// console.log('Decrypted:', decrypted);
