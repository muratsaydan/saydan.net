import { createDecipheriv, hkdfSync } from "crypto";

const ENCRYPTED_PREFIX = "ENC:";

function deriveUserKey(masterKey: Buffer, userId: number): Buffer {
  const info = Buffer.from(`saydanchatbox-user-${userId}`);
  return Buffer.from(
    hkdfSync("sha256", masterKey, Buffer.alloc(0), info, 32)
  );
}

export function decrypt(ciphertext: string, userId: number): string {
  if (!ciphertext || !ciphertext.startsWith(ENCRYPTED_PREFIX)) {
    return ciphertext;
  }

  const masterKeyBase64 = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterKeyBase64) return ciphertext;

  try {
    const masterKey = Buffer.from(masterKeyBase64, "base64");
    const key = deriveUserKey(masterKey, userId);
    const packed = Buffer.from(ciphertext.slice(ENCRYPTED_PREFIX.length), "base64");

    if (packed.length < 28) return ciphertext;

    const nonce = packed.subarray(0, 12);
    const tag = packed.subarray(packed.length - 16);
    const encryptedData = packed.subarray(12, packed.length - 16);

    const decipher = createDecipheriv("aes-256-gcm", key, nonce);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    return ciphertext;
  }
}
