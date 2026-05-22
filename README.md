# NextJS Rainbowkit Boilerplate

<img width="780" height="617" alt="image" src="https://github.com/user-attachments/assets/fa360e46-2c97-4635-b83b-59b56e7fb7ad" />


---

Next.js 16 · wagmi v3 · viem v2 · RainbowKit v2 · Tailwind v4. A minimal starting point: connect a wallet and watch your native balance update live.

## Quick start

```bash
pnpm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get a project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com), then:

```bash
pnpm dev   # http://localhost:3000
```

## What's inside

- **Wallet connection** via RainbowKit (Safe, Rainbow, Base, WalletConnect, MetaMask through EIP-6963)
- **Live native balance** once connected
- **Multi-chain**: Ethereum, Sepolia, BNB Chain, BNB Testnet, Polygon, Polygon Amoy
- **`useTokenBalance`** hook ready for any ERC-20

## Project structure

```
src/
  abis/        # Contract ABIs as const (viem-typed) — erc20.ts
  app/         # App Router: layout, providers, page, globals.css
  components/
    ui/        # Generic UI primitives (button)
    wallet/    # Wallet connection UI
    web3/      # On-chain components (native-balance)
  hooks/       # wagmi hooks only (use-native-balance, use-token-balance)
  lib/         # wagmi-config.ts (single config), utils.ts
```

## Extend

- **Add a chain or wallet**: `src/lib/wagmi-config.ts`
- **Add a contract ABI**: `src/abis/` (export `as const`)
- **Add on-chain logic**: a new hook in `src/hooks/`, consumed by a component in `src/components/`

## Scripts

```bash
pnpm dev              # Dev server
pnpm build && pnpm start   # Production build + serve — checks SSR isn't broken
pnpm lint             # ESLint
```

`pnpm build` is the quickest way to catch SSR/hydration regressions, since `ssr: true` in the wagmi config is required for the App Router.

## Conventions & architecture

Detailed rules (Server Components, wagmi v3 hooks, SIWE auth flow) live in [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md). SIWE is documented there as the intended auth layer and is not yet implemented.
