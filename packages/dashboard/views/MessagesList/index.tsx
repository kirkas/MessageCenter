"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import {
  MESSAGE_CENTER_CONTRACT_ADDRESS,
  MessageCenterAbi,
} from "@message-center/shared";
import MessageItem, { Message } from "../MessageItem";
import { Address } from "viem";
import MessageView from "../MessageView";

export default function MessagesList({ address }: { address: Address }) {
  const [currentMessage, setCurrentMessage] = useState<Message>();

  const { data } = useReadContract({
    address: MESSAGE_CENTER_CONTRACT_ADDRESS,
    account: address,
    abi: MessageCenterAbi,
    functionName: "getUserMessages",

    query: {
      enabled: !!address,
    },
  });

  if (data?.length === 0) {
    return (
      <>
        <h2 className="text-2xl mb-6">Messages</h2>
        <p>You have no messages</p>
      </>
    );
  }

  return (
    <div className="container">
      <h2 className="text-2xl mb-6">Messages</h2>
      <div className="flex flex-row bg-white rounded-xl overflow-hidden w-full ">
        <ul className="w-full flex flex-col h-full bg-white max-w-sm ">
          {data &&
            data.map((message, index) => (
              <li
                key={index}
                onClick={() => setCurrentMessage(message)}
                className="border-b border-blue-100 bg-white hover:bg-blue-50 cursor-pointer"
              >
                <MessageItem message={message} />
              </li>
            ))}
        </ul>
        <div className="border-l border-blue-100">
          {currentMessage ? (
            <MessageView message={currentMessage} />
          ) : (
            <div className="p-20 flex items-center justify-center w-full">
              <p>Select a message to view</p>{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
