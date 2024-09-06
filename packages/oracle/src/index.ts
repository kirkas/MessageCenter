require("dotenv").config({
  path: ["../../.env.local", "../../.env"],
});

import {
  MessageCenterAbi,
  L2ResolverAbi,
  MESSAGE_CENTER_CONTRACT_ADDRESS,
  BASENAME_L2_RESOLVER_CONTRACT_ADDRESS,
} from "@message-center/shared";
import {
  createPublicClient,
  createWalletClient,
  http,
  Address,
  getContract,
  keccak256,
  namehash,
  encodePacked,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia, mainnet } from "viem/chains";
import nodemailer from "nodemailer";
import twilio from "twilio";
import express from "express";
import crypto, { createDecipheriv, KeyLike, privateDecrypt } from "crypto";

// Constant from .env / .env.local
const ORACLE_PUBLIC_KEY = process.env.ORACLE_PUBLIC_KEY as unknown as KeyLike;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const ORACLE_WALLET_PRIVATE_KEY = process.env
  .ORACLE_WALLET_PRIVATE_KEY as Address;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

if (!ORACLE_PUBLIC_KEY || !ORACLE_PRIVATE_KEY) {
  throw new Error("RSA keys missing");
}

// Function to decrypt data with the Oracle's private key
// Decrypt the symmetric key using the private key
export function decryptSymmetricKey(encryptedSymmetricKey: Buffer): Buffer {
  if (!ORACLE_PUBLIC_KEY || !ORACLE_PRIVATE_KEY) {
    throw new Error("RSA keys missing");
  }

  try {
    const decryptedSymmetricKey = privateDecrypt(
      {
        key: ORACLE_PRIVATE_KEY,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      encryptedSymmetricKey
    );
    return decryptedSymmetricKey;
  } catch (error) {
    console.error("Error decrypting symmetric key:", error);
    throw error;
  }
}

// Decrypt the AES-encrypted data
export function decryptField(
  encryptedData: string,
  iv: Buffer,
  symmetricKey: Buffer
): object {
  const algorithm = "aes-256-cbc";
  const decipher = createDecipheriv(algorithm, symmetricKey, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

const showdown = require("showdown");
const converter = new showdown.Converter();
const RPC_URL = "https://sepolia.base.org" as string;

const account = privateKeyToAccount(ORACLE_WALLET_PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(RPC_URL),
});

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

const contract = getContract({
  address: MESSAGE_CENTER_CONTRACT_ADDRESS,
  abi: MessageCenterAbi,
  client: { wallet: walletClient },
});

// Change with your own https://ethereal.email credential for testing
const emailTransporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "asha.predovic97@ethereal.email",
    pass: "zQuz2TzYjAEy8q4vTY",
  },
});

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

interface Message {
  id: bigint;
  sender: Address;
  subject: string;
  body: string;
  timestamp: bigint;
  status: number;
  recipient: Address;
}

/**
 * Convert an chainId to a coinType hex for reverse chain resolution
 */
export const convertChainIdToCoinType = (chainId: number): string => {
  // L1 resolvers to addr
  if (chainId === mainnet.id) {
    return "addr";
  }

  const cointype = (0x80000000 | chainId) >>> 0;
  return cointype.toString(16).toLocaleUpperCase();
};

/**
 * Convert an address to a reverse node for ENS resolution
 */
export const convertReverseNodeToBytes = (
  address: Address,
  chainId: number
) => {
  const addressFormatted = address.toLocaleLowerCase() as Address;
  const addressNode = keccak256(addressFormatted.substring(2) as Address);
  const chainCoinType = convertChainIdToCoinType(chainId);
  const baseReverseNode = namehash(
    `${chainCoinType.toLocaleUpperCase()}.reverse`
  );
  const addressReverseNode = keccak256(
    encodePacked(["bytes32", "bytes32"], [baseReverseNode, addressNode])
  );
  return addressReverseNode;
};

/**
 * An asynchronous function to fetch the Ethereum Name Service (ENS)
 * name for a given Ethereum address. It returns the ENS name if it exists,
 * or null if it doesn't or in case of an error.
 */
export const getName = async ({ address }: { address: Address }) => {
  let client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const addressReverseNode = convertReverseNodeToBytes(address, base.id);
  try {
    const basename = await client.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_CONTRACT_ADDRESS,
      functionName: "name",
      args: [addressReverseNode],
    });
    if (basename) {
      return basename;
    }
  } catch (_error) {
    // This is a best effort attempt, so we don't need to do anything here.
  }
};

async function getUndeliveredMessages(): Promise<Message[]> {
  try {
    const messages = (await publicClient.readContract({
      address: MESSAGE_CENTER_CONTRACT_ADDRESS,
      abi: MessageCenterAbi,
      functionName: "getOracleMessages",
      account,
    })) as Message[];

    return messages.filter((msg) => msg.status === 0);
  } catch (error) {
    console.error("Error fetching undelivered messages:", error);
    return [];
  }
}

async function sendEmail(to: string, message: Message): Promise<void> {
  const { body, subject, sender, recipient } = message;
  const bodyToHtml = converter.makeHtml(body);

  const senderBasename = await getName({ address: sender });
  const recipientBasename = await getName({ address: recipient });

  const bodyStyles = `
    border: 1px solid blue; padding: 16px; border-radius: 16px; margin-top: 16px;
  `;

  const html = `
  <div>
    <div>
      <h1>${subject}</h1>
      <small className="text-xs inline-block w-full opacity-50 hover:opacity-100">
        From: ${senderBasename || sender}
      </small>
      <small className="text-xs inline-block w-full opacity-50 hover:opacity-100">
        To: ${recipientBasename || recipient}
      </small>
      <hr/>
    </div>
    <div style="${bodyStyles}">
      ${bodyToHtml}
    </div>
  </div>`;

  await emailTransporter.sendMail({
    from: {
      name: "oracle.basetest.eth",
      address: "private-relay@base.org",
    },
    to,
    subject,
    html: html,
    text: body,
  });
}

async function sendSMS(to: string, message: Message): Promise<void> {
  const senderBasename = await getName({ address: message.sender });
  const recipientBasename = await getName({ address: message.recipient });
  const body = `\n\n...\n\nHi ${recipientBasename},\n\n${
    senderBasename || message.sender
  } Sent you a message: "${
    message.subject
  }".\n\nView this message at http://localhost:5000/\n`;
  const result = await twilioClient.messages.create({
    body,
    from: "+18557651268",
    to: "+18777804236",
  });
}

async function markMessageAsDelivered(messageId: bigint): Promise<void> {
  try {
    // @ts-ignore
    await contract.write.markMessageAsDelivered([messageId]);
  } catch (error) {
    console.error(
      `Error marking message ${messageId.toString()} as delivered:`,
      error
    );
  }
}

async function processMessages(): Promise<void> {
  const undeliveredMessages = await getUndeliveredMessages();
  console.log("\n------------------------------------------------------");
  console.log("⏳ Process Undelivered messages");

  if (undeliveredMessages.length === 0) {
    console.log("No undelivered messages");
    return;
  }
  for (const message of undeliveredMessages) {
    try {
      const authorization = await publicClient.readContract({
        address: MESSAGE_CENTER_CONTRACT_ADDRESS,
        abi: MessageCenterAbi,
        functionName: "getAuthorization",
        args: [message.recipient, message.sender],
        account,
      });

      const encryptedSymmetricKey = Buffer.from(
        authorization.encryptedSymmetricKey,
        "hex"
      );
      const encryptedData = authorization.encryptedData;
      const iv = authorization.iv;
      const ivBuffer = Buffer.from(iv, "hex");

      // Decrypt the symmetric key
      const symmetricKey = decryptSymmetricKey(encryptedSymmetricKey);

      // Decrypt the data
      const decryptedData = decryptField(encryptedData, ivBuffer, symmetricKey);

      console.log("\n 🔐 Get authorization: ", { authorization });
      console.log("\n 🔓 Decrypt contacts information: ", { decryptedData });

      const { email, phone } = decryptedData as any;

      if (email) {
        await sendEmail(email, message);
      }

      if (phone) {
        await sendSMS(phone, message);
      }

      await markMessageAsDelivered(message.id);
      const senderBasename = await getName({ address: message.sender });
      const oracleBasename = await getName({ address: authorization.oracle });
      const recipientBasename = await getName({ address: message.recipient });
      console.log(`------------------------------------------------------\n
Subject: "${message.subject.toString()}" delivered and marked as such.
From: ${senderBasename}
To: ${recipientBasename}
Delivered by: ${oracleBasename}
\n------------------------------------------------------`);
    } catch (error) {
      console.error(
        `Error processing message ${message.subject.toString()}:`,
        error
      );
    }
  }

  console.log(`📧 ${undeliveredMessages.length} messages delivered`);
}
// Set up Express server
const app = express();
const PORT = 6000;

app.get("/health", (req, res) => {
  res.status(200).send("Oracle is running");
});

app.listen(PORT, () => {
  console.log(`Oracle server is running on port ${PORT}`);
});

// Run the oracle process every 10 seconds
setInterval(processMessages, 1 * 10 * 1000);

// Initial run
processMessages();
