import aes256 from "aes256";
import dotenv from "dotenv";

dotenv.config();

const secret_key = process.env.ENCRYPTION_KEY;

if (!secret_key) {
  throw new Error("Missing ENCRYPTION_KEY in environment variables");
}

// ✅ Encrypt text messages
export const to_Encrypt = (text) => {
  if (!text) return null; // Prevent encrypting empty values
  try {
    return aes256.encrypt(secret_key, text);
  } catch (error) {
    console.error("❌ Error encrypting text:", error.message);
    return null;
  }
};

// ✅ Decrypt text messages
export const to_Decrypt = (cipher) => {
  if (!cipher) return null;
  try {
    return aes256.decrypt(secret_key, cipher);
  } catch (error) {
    console.error("❌ Error decrypting text:", error.message);
    return cipher; // Return encrypted text if decryption fails
  }
};

// ✅ Encrypt files (handles binary data correctly)
export const encryptFile = (fileBuffer) => {
  if (!fileBuffer) return null;
  try {
    const base64String = fileBuffer.toString("base64");
    return aes256.encrypt(secret_key, base64String);
  } catch (error) {
    console.error("❌ Error encrypting file:", error.message);
    return null;
  }
};

// ✅ Decrypt files (returns Buffer)
export const decryptFile = (encryptedFile) => {
  if (!encryptedFile) return null;
  try {
    const decryptedBase64 = aes256.decrypt(secret_key, encryptedFile);
    return Buffer.from(decryptedBase64, "base64");
  } catch (error) {
    console.error("❌ Error decrypting file:", error.message);
    return null;
  }
};
