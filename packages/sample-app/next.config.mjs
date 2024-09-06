
import getEnv from "../../loadEnv.js";

const sharedEnv = getEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      NEXT_PUBLIC_ORACLE_PUBLIC_KEY: sharedEnv.ORACLE_PUBLIC_KEY,
      NEXT_PUBLIC_ORACLE_WALLET_ADDRESS: sharedEnv.ORACLE_WALLET_ADDRESS,
      NEXT_PUBLIC_SAMPLE_DAPP_WALLET_ADDRESS: sharedEnv.SAMPLE_DAPP_WALLET_ADDRESS
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'ipfs.io',
            port: '',
            pathname: '/**',
          },
        ],
      },
};

export default nextConfig;
