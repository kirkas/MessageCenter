"use client";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useEnsAvatar, useReadContract } from "wagmi";
import {
  BASENAME_L2_RESOLVER_CONTRACT_ADDRESS,
  MESSAGE_CENTER_CONTRACT_ADDRESS,
  MessageCenterAbi,
} from "@message-center/shared";
import useWriteContractWithReceipt, {
  WriteTransactionWithReceiptStatus,
} from "@/app/hooks/useWriteContractWithReceipt";
import { baseSepolia } from "viem/chains";
import { Address, ContractFunctionParameters } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import useBaseEnsName from "@/app/hooks/useBaseEnsName";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";
import { PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json";
import {
  encryptField,
  encryptSymmetricKey,
  generateAndStoreSymmetricKey,
} from "@/app/utils/encrypt";

const ORACLE_WALLET_ADDRESS = process.env
  .NEXT_PUBLIC_ORACLE_WALLET_ADDRESS as unknown as Address;

const SAMPLE_DAPP_WALLET_ADDRESS = process.env
  .NEXT_PUBLIC_SAMPLE_DAPP_WALLET_ADDRESS as unknown as Address;

if (!ORACLE_WALLET_ADDRESS) throw new Error("Missing Oracle wallet address");
if (!SAMPLE_DAPP_WALLET_ADDRESS) throw new Error("Missing Dapp Address");

export default function SubscribeForm() {
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [passkeyCredential, setPasskeyCredential] =
    useState<PublicKeyCredentialWithAttestationJSON>();

  const { address, isConnected } = useAccount();
  let [isOpen, setIsOpen] = useState(false);

  const { data: basename } = useBaseEnsName({ address: address });
  const { data: oracleName } = useBaseEnsName({
    address: ORACLE_WALLET_ADDRESS,
  });

  const { data: dappName } = useBaseEnsName({
    address: SAMPLE_DAPP_WALLET_ADDRESS,
  });

  const { data: avatar } = useEnsAvatar({
    name: basename,
    chainId: baseSepolia.id,
    universalResolverAddress: BASENAME_L2_RESOLVER_CONTRACT_ADDRESS,
  });

  const { data: oracleAvatar } = useEnsAvatar({
    name: oracleName,
    chainId: baseSepolia.id,
    universalResolverAddress: BASENAME_L2_RESOLVER_CONTRACT_ADDRESS,
  });

  const { data: dappAvatar } = useEnsAvatar({
    name: dappName,
    chainId: baseSepolia.id,
    universalResolverAddress: BASENAME_L2_RESOLVER_CONTRACT_ADDRESS,
  });

  const {
    data: existingAuthorization,
    isLoading,
    isError,
    refetch,
    error,
  } = useReadContract({
    address: MESSAGE_CENTER_CONTRACT_ADDRESS,
    account: address,
    abi: MessageCenterAbi,
    functionName: "getAuthorization",
    // @ts-ignore: query disabled if no address
    args: [address, SAMPLE_DAPP_WALLET_ADDRESS],
    query: {
      enabled: !!address,
    },
  });

  const {
    initiateTransaction: initiateGrandAuthorization,
    transactionStatus: grandAuthorizationStatus,
    transactionHash,
  } = useWriteContractWithReceipt({
    chain: baseSepolia,
  });

  // Encrypt user data with the same symmetric key
  const encryptUserData = useCallback(
    async (email: string, phone: string) => {
      try {
        // Generate a random symmetric key
        // TODO: DO / Save this via Passkey
        // const symmetricKey = generateSymmetricKey();
        let symmetricKey = undefined;

        // symmetricKey = await retrieveSymmetricKey(basename);

        if (!symmetricKey) {
          symmetricKey = await generateAndStoreSymmetricKey(basename);
        }

        // Combine email and phone into a single object
        const data = { email, phone };

        // Encrypt the combined data with the symmetric key
        const { iv, encryptedData } = encryptField(data, symmetricKey);

        // Encrypt the symmetric key with the oracle's public key
        const encryptedSymmetricKey = encryptSymmetricKey(symmetricKey);

        // Return both the encrypted data and the encrypted symmetric key
        return {
          encryptedData,
          encryptedSymmetricKey,
          iv,
        };
      } catch (error) {
        console.error("Error encrypting data:", error);
        throw error;
      }
    },
    [basename],
  );

  const onClickHandler = useCallback(async () => {
    const { encryptedData, encryptedSymmetricKey, iv } = await encryptUserData(
      email,
      phone,
    );

    const grantAuthorizationCall = {
      address: MESSAGE_CENTER_CONTRACT_ADDRESS,
      abi: MessageCenterAbi,
      functionName: "grantAuthorization",
      args: [
        SAMPLE_DAPP_WALLET_ADDRESS,
        ORACLE_WALLET_ADDRESS,
        encryptedData,
        encryptedSymmetricKey,
        iv,
      ],
    } as ContractFunctionParameters;

    initiateGrandAuthorization(grantAuthorizationCall)
      .then((result) => console.log({ result }))
      .catch((error) => console.log({ error }));
  }, [email, encryptUserData, initiateGrandAuthorization, phone]);

  const success =
    grandAuthorizationStatus === WriteTransactionWithReceiptStatus.Success;

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, [isMounted]);

  const handleOnClose = useCallback(() => {
    refetch();
    setIsOpen(false);
  }, [refetch]);

  if (!isMounted) return null;

  if (existingAuthorization?.isAuthorized) {
    return <p>You are subscribed</p>;
  }

  return (
    <>
      {isConnected ? (
        <Button onClick={() => setIsOpen(true)}>Subscribe onchain</Button>
      ) : (
        <ConnectButton />
      )}
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
                You have succesfully authorized{" "}
                <strong className="text-black">{dappName}</strong>
              </DialogTitle>
              <hr className="max-w-[10rem] w-full border-b border border-blue-200 mx-auto mt-4 mb-4" />
              <Description className="text-sm text-gray-400">
                You can revoke this authorization at anytime via our{" "}
                <Link
                  href="http://localhost:5000/"
                  target="_blank"
                  className="text-blue-500"
                >
                  Mailchain dashboard
                </Link>
              </Description>
            </>
          ) : (
            <>
              <header className="flex flex-row justify-center items-center gap-4 mb-4">
                {avatar && (
                  <Image
                    src={avatar}
                    alt={basename}
                    width="75"
                    height="75"
                    className="rounded-full oveflow-hidden"
                  />
                )}

                <svg
                  className="fill-blue-500 animate-pulse"
                  height="20"
                  viewBox="0 0 1124 367"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1124 166.581H56.8706L195.027 28.4245C201.359 21.7578 201.194 11.2586 194.694 4.9263C188.195 -1.24041 178.028 -1.24041 171.529 4.9263L4.87462 171.579C-1.62487 178.078 -1.62487 188.578 4.87462 195.077L171.529 361.731C178.195 368.064 188.695 367.898 195.027 361.398C201.194 354.899 201.194 344.733 195.027 338.233L56.8706 200.077H1124V166.581Z" />
                </svg>

                {oracleAvatar && (
                  <Image
                    src={oracleAvatar}
                    alt={oracleName}
                    width="50"
                    height="50"
                    className="rounded-full oveflow-hidden"
                  />
                )}
                <svg
                  className="fill-blue-500 animate-pulse"
                  height="20"
                  viewBox="0 0 1124 367"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M-0.000107534 200.099L1067.13 200.099L928.973 338.255C922.641 344.922 922.806 355.421 929.306 361.754C935.805 367.92 945.972 367.92 952.471 361.754L1119.13 195.101C1125.62 188.602 1125.62 178.102 1119.13 171.603L952.471 4.94868C945.805 -1.38362 935.305 -1.218 928.973 5.28148C922.806 11.781 922.806 21.9474 928.973 28.4469L1067.13 166.603L-0.000104605 166.603L-0.000107534 200.099Z" />
                </svg>

                {dappAvatar && (
                  <Image
                    src={dappAvatar}
                    alt={dappName}
                    width="75"
                    height="75"
                    className="rounded-full oveflow-hidden"
                  />
                )}
              </header>

              <DialogTitle className="font-bold text-md text-gray-500">
                Authorize <strong className="text-black">{dappName}</strong>
              </DialogTitle>
              <Description className="text-sm text-gray-500">
                Delivered by{" "}
                <strong className="text-black">{oracleName}</strong>
              </Description>
              <form className="flex flex-col gap-2 text-sm p-4 rounded border border-blue-200 mt-8 mb-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Input
                  type="phone"
                  placeholder="Phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
                <Button onClick={onClickHandler}>Subscribe onchain</Button>
              </form>

              <small className="text-gray-400 italic">
                Your contact information are safely encrypted with passkey, only
                you and <span className="text-gray-500">{oracleName}</span> can
                access it. You can revoke this authorization at anytime via our{" "}
                <Link
                  href="http://localhost:5000/"
                  target="_blank"
                  className="text-gray-500"
                >
                  Mailchain dashboard
                </Link>
              </small>

              <small className="text-gray-400 italic"></small>
            </>
          )}
        </DialogPanel>
      </Dialog>
    </>
  );
}
