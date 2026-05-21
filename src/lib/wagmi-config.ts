import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  base,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { mainnet, sepolia, bsc, bscTestnet, polygon, polygonAmoy } from "viem/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Purpose Test",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, sepolia, bsc, bscTestnet, polygon, polygonAmoy],
  transports: {
    [mainnet.id]: http("https://eth.drpc.org"),
    [sepolia.id]: http("https://sepolia.drpc.org"),
    [bsc.id]: http("https://bsc.drpc.org"),
    [bscTestnet.id]: http("https://bsc-testnet.drpc.org"),
    [polygon.id]: http("https://polygon.drpc.org"),
    [polygonAmoy.id]: http("https://polygon-amoy.drpc.org"),
  },
  ssr: true,
  // metaMaskWallet omitted: its wagmi metaMask() connector requires @metamask/connect-evm (not installed). EIP-6963 picks up MetaMask directly.
  wallets: [
    {
      groupName: "Popular",
      wallets: [safeWallet, rainbowWallet, base, walletConnectWallet],
    },
  ],
});
