import { WalletButton } from "@/components/wallet/connect-button";
import { NativeBalance } from "@/components/web3/native-balance";

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-1 flex-col items-center justify-center overflow-hidden bg-[#FDF7F0] px-6 py-20 dark:bg-[#0c0a12]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-[28rem] rounded-full bg-[#1FC7D4]/30 blur-[120px]" />
        <div className="absolute -right-28 top-1/3 size-[32rem] rounded-full bg-[#ED4B9E]/25 blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 size-[26rem] rounded-full bg-[#FFC83D]/30 blur-[120px]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_center,rgba(118,69,217,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
      />

      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <span className="animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both duration-700 inline-flex items-center gap-2 rounded-full border border-[#1FC7D4]/30 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#0098A1] shadow-sm backdrop-blur dark:bg-white/5 dark:text-[#5FE3EC]">
          <span className="size-1.5 rounded-full bg-[#1FC7D4]" />
          Rainbowkit boilerplate
        </span>

        <h1 className="animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both delay-150 duration-700 mt-6 font-heading text-5xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
          Your wallet,{" "}
          <span className="bg-linear-to-r from-[#1FC7D4] via-[#7645D9] to-[#ED4B9E] bg-clip-text text-transparent">
            served fresh.
          </span>
        </h1>

        <p className="animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both delay-300 duration-700 mt-5 max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          A minimal Web3 starting point on Next.js, wagmi and RainbowKit.
          Connect a wallet to watch your native balance update live.
        </p>

        <div className="animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both delay-500 duration-700 mt-10">
          <WalletButton />
        </div>

        <div className="animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both delay-700 duration-700 mt-12 flex w-full justify-center">
          <NativeBalance />
        </div>
      </main>
    </div>
  );
}
