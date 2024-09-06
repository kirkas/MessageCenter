"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import MessagesList from "@/views/MessagesList";

export default function Home() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { address, isConnecting, isReconnecting } = useAccount();

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, [isMounted]);

  if (!isMounted) return null;
  if (isConnecting || isReconnecting)
    return <p className="text-center p-20">Loading</p>;

  if (!address)
    return <p className="text-center p-20">Connect Wallet to get Started</p>;

  return <MessagesList address={address} />;
}
