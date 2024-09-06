"use client";

import Button from "@/components/Button";
import useBaseEnsName from "@/hooks/useBaseEnsName";
import useWriteContractWithReceipt from "@/hooks/useWriteContractWithReceipt";
import { useCallback, useState } from "react";
import { baseSepolia } from "viem/chains";
import {
  MESSAGE_CENTER_CONTRACT_ADDRESS,
  MessageCenterAbi,
} from "@message-center/shared";
import Link from "next/link";
import { decryptField, retrieveSymmetricKey } from "@/utils/encrypt";
import { Address } from "viem";
import { useEnsAvatar } from "wagmi";
import Image from "next/image";

type AuthInfo = {
  sender: `0x${string}`;
  oracle: `0x${string}`;
  isAuthorized: boolean;
  messageCount: bigint;
  encryptedData: string;
  encryptedSymmetricKey: string;
  iv: string;
};

export default function AuthorizationItem({
  authInfo,
  address,
}: {
  authInfo: AuthInfo;
  address: Address;
}) {
  const { data: oracleName } = useBaseEnsName({ address: authInfo.oracle });
  const { data: senderName } = useBaseEnsName({ address: authInfo.sender });
  const { data: basename } = useBaseEnsName({ address: address });
  const [email, setEmail] = useState<string>();
  const [phone, setPhone] = useState<string>();
  const {
    initiateTransaction: initiateGrandAuthorization,
    transactionStatus: reclaimStatus,
    transactionHash,
  } = useWriteContractWithReceipt({
    chain: baseSepolia,
  });

  const revokeAuthorization = useCallback(() => {
    initiateGrandAuthorization({
      address: MESSAGE_CENTER_CONTRACT_ADDRESS,
      abi: MessageCenterAbi,
      functionName: "revokeAuthorization",
      args: [authInfo.sender],
    });
  }, [authInfo.sender, initiateGrandAuthorization]);

  const decryptAuthorization = useCallback(async () => {
    if (!basename) return;
    const assymetricKey = await retrieveSymmetricKey(basename);

    const data = await decryptField(
      authInfo.encryptedData,
      authInfo.iv,
      assymetricKey,
    );

    const { email, phone } = data as any;

    if (email) setEmail(email);
    if (phone) setPhone(phone);
  }, [authInfo.encryptedData, authInfo.iv, basename]);

  const { data: senderAvatar } = useEnsAvatar({
    name: senderName,
    chainId: baseSepolia.id,
    universalResolverAddress: "0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA",
  });

  const { data: oracleAvatar } = useEnsAvatar({
    name: oracleName,
    chainId: baseSepolia.id,
    universalResolverAddress: "0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA",
  });

  return (
    <>
      <td className="px-6 py-4">
        <div className="flex gap-2 items-center ">
          {senderAvatar && senderName && (
            <Image
              src={senderAvatar}
              alt={senderName}
              width="25"
              height="25"
              className="rounded-full oveflow-hidden"
            />
          )}
          <span>{senderName || authInfo.sender}</span>
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
          <span>{oracleName || authInfo.oracle}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {email && phone ? (
          <p>
            {email}, {phone}
          </p>
        ) : (
          <div className="flex gap-2">
            <span>------</span>
            <Link
              href="#decrypto"
              onClick={decryptAuthorization}
              className="text-blue-500"
            >
              Decrypt
            </Link>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <Button onClick={revokeAuthorization}>Revoke</Button>
      </td>
    </>
  );
}
