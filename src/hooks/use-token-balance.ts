"use client";

import { useReadContract, useConnection } from "wagmi";
import { formatUnits } from "viem";
import { erc20Abi } from "@/abis/erc20";

export function useTokenBalance(tokenAddress: `0x${string}` | undefined) {
  const { address } = useConnection();

  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!tokenAddress },
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !!tokenAddress },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: !!tokenAddress },
  });

  const formatted =
    balance !== undefined && decimals !== undefined
      ? formatUnits(balance, decimals)
      : undefined;

  return { balance, formatted, symbol, isLoading: balanceLoading };
}
