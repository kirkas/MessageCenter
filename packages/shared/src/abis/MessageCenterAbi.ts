export default [
  { inputs: [], name: "AuthorizationAlreadyGranted", type: "error" },
  { inputs: [], name: "AuthorizationNotFound", type: "error" },
  { inputs: [], name: "InvalidMessageId", type: "error" },
  { inputs: [], name: "MessageAlreadyDelivered", type: "error" },
  { inputs: [], name: "NoZeroAddress", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
    ],
    name: "NotAuthorizedToSend",
    type: "error",
  },
  { inputs: [], name: "OnlyAuthorizedOracle", type: "error" },
  { inputs: [], name: "UnauthorizedOracle", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "oracle",
        type: "address",
      },
    ],
    name: "AuthorizationGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "oracle",
        type: "address",
      },
    ],
    name: "AuthorizationRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "messageId",
        type: "uint256",
      },
    ],
    name: "MessageDelivered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "messageId",
        type: "uint256",
      },
    ],
    name: "MessageSent",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "address", name: "_sender", type: "address" },
    ],
    name: "getAuthorization",
    outputs: [
      {
        components: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "bool", name: "isAuthorized", type: "bool" },
          { internalType: "uint256", name: "messageCount", type: "uint256" },
          { internalType: "string", name: "encryptedData", type: "string" },
          {
            internalType: "string",
            name: "encryptedSymmetricKey",
            type: "string",
          },
          { internalType: "string", name: "iv", type: "string" },
        ],
        internalType: "struct MessageCenter.Authorization",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOracleAuthorizations",
    outputs: [
      {
        components: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "bool", name: "isAuthorized", type: "bool" },
          { internalType: "uint256", name: "messageCount", type: "uint256" },
          { internalType: "string", name: "encryptedData", type: "string" },
          {
            internalType: "string",
            name: "encryptedSymmetricKey",
            type: "string",
          },
          { internalType: "string", name: "iv", type: "string" },
        ],
        internalType: "struct MessageCenter.Authorization[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOracleMessages",
    outputs: [
      {
        components: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "string", name: "subject", type: "string" },
          { internalType: "string", name: "body", type: "string" },
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          {
            internalType: "enum MessageCenter.MessageStatus",
            name: "status",
            type: "uint8",
          },
          { internalType: "address", name: "recipient", type: "address" },
        ],
        internalType: "struct MessageCenter.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSenderAuthorizations",
    outputs: [
      {
        components: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "uint256", name: "messageCount", type: "uint256" },
        ],
        internalType: "struct MessageCenter.SenderAuthorizationInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUserAuthorizations",
    outputs: [
      {
        components: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "bool", name: "isAuthorized", type: "bool" },
          { internalType: "uint256", name: "messageCount", type: "uint256" },
          { internalType: "string", name: "encryptedData", type: "string" },
          {
            internalType: "string",
            name: "encryptedSymmetricKey",
            type: "string",
          },
          { internalType: "string", name: "iv", type: "string" },
        ],
        internalType: "struct MessageCenter.Authorization[]",
        name: "authsInfo",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUserMessages",
    outputs: [
      {
        components: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "string", name: "subject", type: "string" },
          { internalType: "string", name: "body", type: "string" },
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          {
            internalType: "enum MessageCenter.MessageStatus",
            name: "status",
            type: "uint8",
          },
          { internalType: "address", name: "recipient", type: "address" },
        ],
        internalType: "struct MessageCenter.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_sender", type: "address" },
      { internalType: "address", name: "_oracle", type: "address" },
      { internalType: "string", name: "_encryptedData", type: "string" },
      {
        internalType: "string",
        name: "_encryptedSymmetricKey",
        type: "string",
      },
      { internalType: "string", name: "_iv", type: "string" },
    ],
    name: "grantAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_messageId", type: "uint256" }],
    name: "markMessageAsDelivered",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_sender", type: "address" }],
    name: "revokeAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "_recipients", type: "address[]" },
      { internalType: "string", name: "_body", type: "string" },
      { internalType: "string", name: "_subject", type: "string" },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
