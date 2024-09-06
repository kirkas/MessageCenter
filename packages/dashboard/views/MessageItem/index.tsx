"use client";

import useBaseEnsName from "@/hooks/useBaseEnsName";
import Image from "next/image";
import Markdown from "react-markdown";
import { baseSepolia } from "viem/chains";
import { useEnsAvatar } from "wagmi";

export type Message = {
  sender: `0x${string}`;
  subject: string;
  body: string;
  timestamp: bigint;
  status: number;
  recipient: `0x${string}`;
};

export default function MessageItem({ message }: { message: Message }) {
  const { data: senderBasename } = useBaseEnsName({ address: message.sender });
  const { data: recipientBasename } = useBaseEnsName({
    address: message.recipient,
  });

  const { data: senderAvatar, isPending } = useEnsAvatar({
    name: senderBasename,
    chainId: baseSepolia.id,
    universalResolverAddress: "0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA",
    query: {
      enabled: !!senderBasename,
    },
  });

  return (
    <article className="flex flex-row gap-2 p-4">
      <div>
        {senderAvatar && (
          <Image
            src={senderAvatar}
            alt={senderBasename}
            width={40}
            className="rounded-full overflow-hidden h-[40px] w-[40px]"
            height={40}
          />
        )}
      </div>
      <header>
        <h1 className="text-md">{senderBasename || message.sender}</h1>
        <p className="text-sm">{message.subject}</p>
      </header>
    </article>
  );
}
