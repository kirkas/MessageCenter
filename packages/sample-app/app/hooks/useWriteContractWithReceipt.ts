import { useCallback, useEffect, useState } from "react";
import { Chain, ContractFunctionParameters } from "viem";
import {
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

/*
  A hook to request and track a wallet write transaction

  Responsabilities:
  - Track the wallet request status
  - Track the transaction receipt and status
  - Log analytics & error
*/

export enum WriteTransactionWithReceiptStatus {
  Idle = "idle",

  // Wallet transaction
  Initiated = "initiated",
  Canceled = "canceled",
  Approved = "approved",

  // On-chain status
  Processing = "processing",
  Reverted = "reverted",
  Success = "success",
}

export type UseWriteContractWithReceiptProps = {
  chain: Chain;
};

export default function useWriteContractWithReceipt({
  chain,
}: UseWriteContractWithReceiptProps) {
  const { chain: connectedChain } = useAccount();

  const [transactionStatus, setTransactionStatus] =
    useState<WriteTransactionWithReceiptStatus>(
      WriteTransactionWithReceiptStatus.Idle,
    );

  // Write TextRecords
  const {
    data: transactionHash,
    writeContractAsync: writeContractMutation,
    isPending: writeContractIsPending,
    isError: writeContractIsError,
    error: writeContractError,
    isSuccess: writeContractIsSuccess,
    reset: writeContractReset,
  } = useWriteContract();

  // Wait for TextRecords transaction to be processed
  const {
    data: transactionReceipt,
    isFetching: transactionReceiptIsFetching,
    isSuccess: transactionReceiptIsSuccess,
    isError: transactionReceiptIsError,
    error: transactionReceiptError,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
    chainId: chain.id,
    query: {
      enabled: !!transactionHash,
    },
  });

  const { switchChainAsync } = useSwitchChain();

  const initiateTransaction = useCallback(
    async (contractParameters: ContractFunctionParameters) => {
      console.log({ connectedChain });
      if (!connectedChain) return;

      if (connectedChain.id !== chain.id) {
        await switchChainAsync({ chainId: chain.id });
      }

      try {
        setTransactionStatus(WriteTransactionWithReceiptStatus.Initiated);

        await writeContractMutation(contractParameters);

        setTransactionStatus(WriteTransactionWithReceiptStatus.Approved);
      } catch (error) {
        console.log("OH HNO", { error });
        setTransactionStatus(WriteTransactionWithReceiptStatus.Canceled);
      }
    },
    [chain.id, connectedChain, switchChainAsync, writeContractMutation],
  );

  // Track processing onchain
  useEffect(() => {
    if (transactionReceiptIsFetching) {
      setTransactionStatus(WriteTransactionWithReceiptStatus.Processing);
    }
  }, [transactionReceiptIsFetching]);

  // Track onchain success or reverted state
  useEffect(() => {
    if (transactionReceipt?.status === "success") {
      setTransactionStatus(WriteTransactionWithReceiptStatus.Success);
      writeContractReset();
      return;
    }

    if (transactionReceipt?.status === "reverted") {
      setTransactionStatus(WriteTransactionWithReceiptStatus.Reverted);
      return;
    }
  }, [transactionReceipt?.status, writeContractReset]);

  const transactionIsLoading =
    writeContractIsPending || transactionReceiptIsFetching;
  const transactionIsSuccess =
    writeContractIsSuccess && transactionReceiptIsSuccess;
  const transactionIsError = writeContractIsError || transactionReceiptIsError;
  const transactionError = writeContractError ?? transactionReceiptError;

  return {
    initiateTransaction,
    transactionHash,
    transactionStatus,
    transactionReceipt,
    transactionIsLoading,
    transactionIsSuccess,
    transactionIsError,
    transactionError,
  };
}
