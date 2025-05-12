import { authenticator } from 'otplib';
//@ts-ignore
import qrcode from 'qrcode';

export function createTotpSecret(userEmail: string) {
    const secret = authenticator.generateSecret();

    const otpauth = authenticator.keyuri(
        userEmail,
        'CampusBazaar',
        secret
    );

    return { secret, otpauth }; // Store `secret` securely in DB (e.g., encrypted)
}

export async function generateQRCode(otpauth: string) {
    return await qrcode.toDataURL(otpauth); // Render this on frontend
}

export function verifyTotpToken(secret: string, token: string): boolean {
    return authenticator.check(token, secret);
}