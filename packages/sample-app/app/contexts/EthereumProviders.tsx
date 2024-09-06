"use client";

import "@rainbow-me/rainbowkit/styles.css";
import "@coinbase/onchainkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import {
  connectorsForWallets,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  uniswapWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
// export const config = createConfig({
//   chains: [baseSepolia],
//   connectors: [coinbaseWallet()],
//   transports: {
//     [baseSepolia.id]: http(),
//   },
//   ssr: true,
// });
coinbaseWallet.preference = "all";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        coinbaseWallet,
        metaMaskWallet,
        uniswapWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    projectId: "dummy-id",
    walletConnectParameters: {},
    appName: "Memcoin.org",
    appDescription: "",
    appUrl: "https://www.memecoin.org/",
    appIcon: "",
  },
);

const config = createConfig({
  connectors,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
const queryClient = new QueryClient();

export default function EthereumProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
