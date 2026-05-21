"use client";

import { useNativeBalance } from "@/hooks/use-native-balance";
import { cn } from "@/lib/utils";

function formatBalance(formatted: string | undefined) {
  if (formatted === undefined) return "0";
  const value = Number(formatted);
  if (!Number.isFinite(value)) return formatted;
  if (value > 0 && value < 0.0001) return "<0.0001";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value);
}

function shortAddress(address: string | undefined) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative w-full max-w-sm">
      <div
        aria-hidden
        className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-[#1FC7D4] via-[#7645D9] to-[#ED4B9E] opacity-50 blur-md transition-opacity duration-500 group-hover:opacity-80"
      />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-7 shadow-[0_18px_50px_-20px_rgba(118,69,217,0.45)] backdrop-blur-xl transition-transform duration-500 group-hover:-translate-y-1 dark:border-white/10 dark:bg-zinc-900/70">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gradient-to-br from-[#FFD75E] to-[#FF8FB6] opacity-30 blur-2xl"
        />
        {children}
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-full bg-[#1FC7D4] shadow-[0_0_0_4px_rgba(31,199,212,0.18)]" />
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
        Native balance
      </span>
    </div>
  );
}

export function NativeBalance() {
  const { isConnected, isLoading, formatted, symbol, chainName, address } =
    useNativeBalance();

  if (!isConnected) {
    return (
      <Shell>
        <Label />
        <p className="mt-5 font-heading text-2xl font-semibold leading-tight text-zinc-400 dark:text-zinc-500">
          Connect your wallet
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Your on-chain balance will appear here once a wallet is linked.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <Label />
        {chainName && (
          <span className="rounded-full bg-[#1FC7D4]/12 px-3 py-1 text-xs font-semibold text-[#0098A1] dark:text-[#5FE3EC]">
            {chainName}
          </span>
        )}
      </div>

      <div className="mt-6 flex items-end gap-2">
        {isLoading ? (
          <span className="h-11 w-40 animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-700/60" />
        ) : (
          <>
            <span
              className={cn(
                "font-heading text-5xl font-bold leading-none tracking-tight tabular-nums",
                "bg-gradient-to-br from-zinc-900 to-zinc-600 bg-clip-text text-transparent",
                "dark:from-white dark:to-zinc-400"
              )}
            >
              {formatBalance(formatted)}
            </span>
            {symbol && (
              <span className="pb-1 text-lg font-semibold text-[#7645D9] dark:text-[#B69CF5]">
                {symbol}
              </span>
            )}
          </>
        )}
      </div>

      {address && (
        <div className="mt-6 flex items-center gap-2 border-t border-zinc-100 pt-4 dark:border-white/5">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">Wallet</span>
          <span className="font-mono text-xs text-zinc-600 dark:text-zinc-300">
            {shortAddress(address)}
          </span>
        </div>
      )}
    </Shell>
  );
}
