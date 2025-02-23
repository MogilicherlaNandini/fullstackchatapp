import { to_Encrypt, to_Decrypt } from "./lib/aes.js";

const secretText = "Hello, this is a test!";
const encryptedText = to_Encrypt(secretText);
console.log("Encrypted:", encryptedText);

const decryptedText = to_Decrypt(encryptedText);
console.log("Decrypted:", decryptedText);
