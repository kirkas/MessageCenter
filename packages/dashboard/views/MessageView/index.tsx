"use client";

import useBaseEnsName from "@/hooks/useBaseEnsName";

import Markdown from "react-markdown";
import { Message } from "../MessageItem";

export default function MessageView({ message }: { message: Message }) {
  const { data: senderBasename } = useBaseEnsName({ address: message.sender });
  const { data: recipientBasename } = useBaseEnsName({
    address: message.recipient,
  });
  console.log({ message });
  return (
    <article className="flex flex-col gap-2 bg-white rounded p-4">
      <header>
        <h1>{message.subject}</h1>
        <small className="text-xs inline-block w-full opacity-50 hover:opacity-100">
          From: {senderBasename || message.sender}
        </small>
        <small className="text-xs inline-block w-full opacity-50 hover:opacity-100">
          To: {recipientBasename || message.recipient}
        </small>
        <Markdown className="flex flex-col gap-4 p-4 text-sm border border-blue-200 rounded-2xl mt-6">
          {message.body}
        </Markdown>
      </header>
    </article>
  );
}
