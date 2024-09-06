import crypto, {
  createCipheriv,
  KeyLike,
  publicEncrypt,
  randomBytes,
} from "crypto";
import { Buffer } from "buffer";
import { create, get } from "@github/webauthn-json";

// TODO: Should really be on the server side
// Also probably should be on the contract!
const ORACLE_PUBLIC_KEY_FROM_LOCAL_ENV = process.env
  .NEXT_PUBLIC_ORACLE_PUBLIC_KEY as unknown as KeyLike;

const ORACLE_PUBLIC_KEY_FROM_ROOT_ENV = process.env
  .NEXT_PUBLIC_ORACLE_PUBLIC_KEY_FROM_ROOT_ENV as unknown as KeyLike;

const ORACLE_PUBLIC_KEY =
  ORACLE_PUBLIC_KEY_FROM_LOCAL_ENV || ORACLE_PUBLIC_KEY_FROM_ROOT_ENV;

if (!ORACLE_PUBLIC_KEY) throw new Error("Missing Oracle public key");

// Encrypt JSON data with AES symmetric encryption
export function encryptField(
  data: object,
  symmetricKey: Buffer,
): { iv: string; encryptedData: string } {
  const algorithm = "aes-256-cbc";
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, symmetricKey, iv);
  const jsonString = JSON.stringify(data);
  let encrypted = cipher.update(jsonString, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
}

// Encrypt the symmetric key with the oracle's public key
export function encryptSymmetricKey(symmetricKey: Buffer): string {
  console.log({ ORACLE_PUBLIC_KEY });
  try {
    const encryptedSymmetricKey = publicEncrypt(
      {
        key: ORACLE_PUBLIC_KEY,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      symmetricKey,
    );
    return encryptedSymmetricKey.toString("hex");
  } catch (error) {
    console.error("Error encrypting symmetric key:", error);
    throw error;
  }
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generateAndStoreSymmetricKey(userId: string): Promise<Buffer> {
  const challenge = randomBytes(32);

  const credential = await create({
    publicKey: {
      challenge: bufferToBase64url(challenge),
      rp: { name: "Your App Name" },
      user: {
        id: bufferToBase64url(Buffer.from(userId)),
        name: userId,
        displayName: userId,
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
    },
  });

  // Use the credential.rawId as the seed for the symmetric key
  const symmetricKey = crypto
    .createHash("sha256")
    .update(Buffer.from(credential.rawId, "base64"))
    .digest();
  return symmetricKey;
}

async function hasLocalPasskey(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false;
  }

  return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

async function retrieveSymmetricKey(userId: string): Promise<Buffer | null> {
  // Check if the user has a local passkey
  const hasPasskey = await hasLocalPasskey();
  if (!hasPasskey) {
    console.log("No local passkey available");
    return null;
  }

  const challenge = randomBytes(32);

  const assertion = await get({
    publicKey: {
      challenge: bufferToBase64url(challenge),
      rpId: window.location.hostname,
      userVerification: "required",
    },
  });

  // Regenerate the symmetric key using the same method
  const symmetricKey = crypto
    .createHash("sha256")
    .update(Buffer.from(assertion.rawId, "base64"))
    .digest();
  return symmetricKey;
}

export { generateAndStoreSymmetricKey, retrieveSymmetricKey };
