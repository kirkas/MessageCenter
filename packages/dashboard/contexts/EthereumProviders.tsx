"use client";

import "@rainbow-me/rainbowkit/styles.css";
import "@coinbase/onchainkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  uniswapWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import Link from "next/link";
import WalletState from "@/views/WalletState";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <OnchainKitProvider chain={baseSepolia}>
            <nav className="mb-20">
              <ul className="flex gap-8 bg-white px-6 py-4 text-center items-center justify-center text-blue-500 rounded-2xl">
                <li className="mr-auto">
                  <Link
                    href="/"
                    className="flex gap-2 items-center justify-center "
                  >
                    <svg
                      width="25"
                      height="25"
                      viewBox="0 0 111 111"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
                        fill="#0052FF"
                      />
                    </svg>
                    Inbox
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      pathname === "/"
                        ? "font-bold text-blue-700"
                        : "font-light text-blue-400"
                    }
                    href="/"
                  >
                    Messages
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      pathname === "/send"
                        ? "font-bold text-blue-700"
                        : "font-light text-blue-400"
                    }
                    href="/send"
                  >
                    Send messages
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      pathname === "/authorizations"
                        ? "font-bold text-blue-700"
                        : "font-light text-blue-400"
                    }
                    href="/authorizations"
                  >
                    Manage Notifications
                  </Link>
                </li>
                <li className="ml-auto">
                  <WalletState />
                </li>
              </ul>
            </nav>
            {children}
          </OnchainKitProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
