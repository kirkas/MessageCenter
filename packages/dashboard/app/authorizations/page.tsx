"use client";
import AuthorizationsManager from "@/views/AuthorizationsManager";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

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

  return <AuthorizationsManager address={address} />;
}
