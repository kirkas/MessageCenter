"use client";

import { useReadContract } from "wagmi";
import {
  MESSAGE_CENTER_CONTRACT_ADDRESS,
  MessageCenterAbi,
} from "@message-center/shared";
import AuthorizationItem from "../AuthorizationItem";
import { Address } from "viem";

export default function AuthorizationsManager({
  address,
}: {
  address: Address;
}) {
  const { data } = useReadContract({
    address: MESSAGE_CENTER_CONTRACT_ADDRESS,
    account: address,
    abi: MessageCenterAbi,
    functionName: "getUserAuthorizations",
  });

  if (data?.length === 0) {
    return (
      <>
        <h2 className="text-2xl mb-6">Authorized Senders</h2>
        <p>You have no authorizations</p>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl mb-6">Authorized Senders</h2>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-lg overflow-hidden">
        <thead className="text-xs text-blue-500 uppercase bg-blue-100">
          <tr>
            <th scope="col" className="px-6 py-3">
              Sender
            </th>
            <th scope="col" className="px-6 py-3">
              Oracle
            </th>
            <th scope="col" className="px-6 py-3">
              Contacts
            </th>
            <th scope="col" className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((authInfo) => (
              <tr
                className="border-b odd:bg-white even:bg-gray-50"
                key={authInfo.sender}
              >
                <AuthorizationItem authInfo={authInfo} address={address} />
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
