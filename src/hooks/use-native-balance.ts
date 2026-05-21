"use client";

import { useBalance, useConnection } from "wagmi";
import { formatUnits } from "viem";

export function useNativeBalance() {
  const { address, isConnected, chain } = useConnection();

  // address can be defined during `reconnecting` even when isConnected is false in wagmi v3
  const { data, isLoading } = useBalance({
    address: isConnected ? address : undefined,
    query: { enabled: isConnected && !!address },
  });

  const formatted =
    data?.value !== undefined && data?.decimals !== undefined
      ? formatUnits(data.value, data.decimals)
      : undefined;

  return {
    address,
    isConnected,
    chainName: chain?.name,
    formatted,
    symbol: data?.symbol,
    isLoading,
  };
}
