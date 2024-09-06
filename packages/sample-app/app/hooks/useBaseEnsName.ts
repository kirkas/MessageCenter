"use client";
import { Address, isAddress } from "viem";

import {
  Basename,
  GetNameReturnType,
  useName,
} from "@coinbase/onchainkit/identity";
import { UseQueryResult } from "@tanstack/react-query";
import { baseSepolia } from "viem/chains";

export type UseBaseEnsNameProps = {
  address?: Address;
};

export type BaseEnsNameData = BaseName | undefined;

// Wrapper around onchainkit's useName
export default function useBaseEnsName({ address }: UseBaseEnsNameProps) {
  const { data, isLoading, refetch, isFetching } = useName(
    {
      address: address,
      chain: baseSepolia,
    },
    {
      enabled: !!address && isAddress(address),
    },
  ) as UseQueryResult<GetNameReturnType, Error>;

  const ensNameTyped = data ? (data as BaseName) : undefined;

  return {
    data: ensNameTyped,
    isLoading,
    isFetching,
    refetch,
  };
}
