"use client";

import Button from "@/components/Button";
import useWriteContractWithReceipt, {
  WriteTransactionWithReceiptStatus,
} from "@/hooks/useWriteContractWithReceipt";
import { useCallback, useMemo, useState } from "react";
import { baseSepolia } from "viem/chains";
import {
  BASENAME_L2_RESOLVER_CONTRACT_ADDRESS,
  MESSAGE_CENTER_CONTRACT_ADDRESS,
  MessageCenterAbi,
} from "@message-center/shared";
import Textarea from "@/components/Textarea";
import { ContractFunctionParameters } from "viem";
import Input from "@/components/Input";
import useBaseEnsName from "@/hooks/useBaseEnsName";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useEnsAvatar } from "wagmi";
import Image from "next/image";

type User = {
  user: `0x${string}`;
  oracle: `0x${string}`;
  messageCount: bigint;
};

export default function UserItem({ user }: { user: User }) {
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  let [isOpen, setIsOpen] = useState(false);
  const { data: userBasename } = useBaseEnsName({ address: user.user });
  const { data: oracleName } = useBaseEnsName({ address: user.oracle });
  const {
    initiateTransaction: initiateSendNotification,
    transactionStatus: sendNotificationStatus,
    transactionIsLoading,
  } = useWriteContractWithReceipt({
    chain: baseSepolia,
  });

  const grandAuthorizationCall = useMemo(() => {
    return {
      address: MESSAGE_CENTER_CONTRACT_ADDRESS,
      abi: MessageCenterAbi,
      functionName: "sendMessage",
      args: [[user.user], message, subject],
    } as ContractFunctionParameters;
  }, [message, subject, user.user]);

  const onClickHandler = useCallback(() => {
    initiateSendNotification(grandAuthorizationCall)
      .then((result) => console.log({ result }))
      .catch((error) => console.log({ error }));
  }, [grandAuthorizationCall, initiateSendNotification]);

  const handleOnClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const { data: avatar } = useEnsAvatar({
    name: userBasename,
    chainId: baseSepolia.id,
    universalResolverAddress: BASENAME_L2_RESOLVER_CONTRACT_ADDRESS,
  });

  const { data: oracleAvatar } = useEnsAvatar({
    name: oracleName,
    chainId: baseSepolia.id,
    universalResolverAddress: BASENAME_L2_RESOLVER_CONTRACT_ADDRESS,
  });

  const pending = transactionIsLoading;

  const success =
    sendNotificationStatus === WriteTransactionWithReceiptStatus.Success;

  return (
    <>
      <td className="px-6 py-4">
        <div className="flex gap-2 items-center ">
          {avatar && userBasename && (
            <Image
              src={avatar}
              alt={userBasename}
              width="25"
              height="25"
              className="rounded-full oveflow-hidden"
            />
          )}
          <span>{userBasename || user.user}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2 items-center ">
          {oracleAvatar && oracleName && (
            <Image
              src={oracleAvatar}
              alt={oracleName}
              width="25"
              height="25"
              className="rounded-full oveflow-hidden"
            />
          )}
          <span>{oracleName || user.oracle}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <Button onClick={() => setIsOpen(true)}>Send message</Button>
        <Dialog
          open={isOpen}
          onClose={handleOnClose}
          transition
          className="fixed inset-0 flex w-screen items-center justify-center bg-black/30  transition duration-300 ease-out data-[closed]:opacity-0 mb-4"
        >
          <DialogPanel className="max-w-lg bg-blue-50 py-12 px-8 text-center flex flex-col gap-2 rounded text-black">
            {success ? (
              <>
                <svg
                  width="50px"
                  height="50px"
                  viewBox="0 0 48 48"
                  version="1"
                  xmlns="http://www.w3.org/2000/svg"
                  enable-background="new 0 0 48 48"
                  className="fill-blue-500 mx-auto"
                >
                  <polygon points="40.6,12.1 17,35.7 7.4,26.1 4.6,29 17,41.3 43.4,14.9" />
                </svg>
                <DialogTitle className="font-bold text-md text-gray-500">
                  You have sent a message to{" "}
                  <strong className="text-black">{userBasename}</strong>
                </DialogTitle>
              </>
            ) : (
              <>
                <DialogTitle className="font-bold text-md text-gray-500">
                  Send message to{" "}
                  <strong className="text-black">{userBasename}</strong>
                </DialogTitle>
                <Description className="text-sm text-gray-500">
                  Delivered by{" "}
                  <strong className="text-black">{oracleName}</strong>
                </Description>
                <form className="flex flex-col gap-2">
                  <Input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Subject"
                    disabled={pending}
                  />
                  <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Message"
                    disabled={pending}
                  />
                  <Button onClick={onClickHandler} disabled={pending}>
                    {pending ? "Sending..." : "Send"}
                  </Button>
                </form>
              </>
            )}
          </DialogPanel>
        </Dialog>
        {/* <Button onClick={revokeAuthorization}>Revoke</Button> */}
      </td>
    </>
  );
  // return (
  //   <div>
  //     {user.user}
  // <form className="flex flex-col gap-2">
  //   <Input
  //     value={subject}
  //     onChange={(event) => setSubject(event.target.value)}
  //     placeholder="Subject"
  //   />
  //   <Textarea
  //     value={message}
  //     onChange={(event) => setMessage(event.target.value)}
  //     placeholder="Message"
  //   />
  //   <Button onClick={onClickHandler}>Send</Button>
  // </form>
  //   </div>
  // );
}
