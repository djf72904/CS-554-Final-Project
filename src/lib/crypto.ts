import CryptoJS from 'crypto-es'

const ENCRYPTION_KEY = "THISISATESTSECRET"

export function encryptSecret(secret: string) {
    return CryptoJS.AES.encrypt(secret, ENCRYPTION_KEY).toString();
}

export function decryptSecret(ciphertext: string) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}