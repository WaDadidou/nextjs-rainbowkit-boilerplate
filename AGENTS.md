<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes -- APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Architecture

## Stack Versions

| Package | Version | Notes |
|---|---|---|
| Next.js | 16.x | App Router only. Pages Router is absent. |
| React | 19.x | Server Components are the default. |
| wagmi | 3.x | Breaking changes from v2. Verify hook APIs before use. |
| viem | 2.x | Used directly for low-level types and utilities. |
| RainbowKit | 2.x | Built on wagmi v3. Uses WalletConnect v2 project ID. |
| @tanstack/react-query | 5.x | Required peer dep of wagmi. QueryClient is shared. |
| Tailwind CSS | 4.x | Breaking changes from v3. Uses PostCSS plugin, no `tailwind.config.js`. |
| TypeScript | 5.x | Strict mode assumed. |

**Before calling any wagmi, viem, or RainbowKit API, verify the current signature in `node_modules/` or via context7 MCP. Training data reflects older versions.**

---

## Folder Structure

```
src/
  abis/              # Contract ABIs as TypeScript `as const` arrays
  app/               # Next.js App Router -- all routes live here
    layout.tsx       # Root layout: wraps everything in <Providers>
    providers.tsx    # "use client" -- WagmiProvider > QueryClientProvider > RainbowKitProvider
    page.tsx         # Root page (Server Component by default)
    globals.css      # Global styles and Tailwind base imports
    api/             # Route Handlers (server-side, replaces /pages/api)
      auth/
        nonce/route.ts      # GET -- generate and store SIWE nonce
        verify/route.ts     # POST -- verify SIWE message and issue session
        session/route.ts    # GET -- return current session (address)
        logout/route.ts     # POST -- destroy session
  components/
    ui/              # Generic, stateless UI primitives (no wagmi dependencies)
    wallet/          # Wallet-specific UI (ConnectButton wrappers, address display)
    web3/            # On-chain-aware components (token displays, contract interactions)
  hooks/             # Custom React hooks -- wagmi hooks ONLY, no direct viem calls
  lib/
    wagmi-config.ts  # wagmiConfig built with getDefaultConfig from RainbowKit
    siwe.ts          # SIWE message construction helpers (shared between client/server)
    session.ts       # Server-only: session read/write (iron-session or similar)
```

### Naming conventions

- React components: `PascalCase.tsx`
- Custom hooks: `use-kebab-case.ts`
- Utilities and configs: `kebab-case.ts`
- Route Handlers: `route.ts` inside `app/api/**`
- ABIs: `kebab-case.ts` exporting a named `const` with `as const`

---

## Web3 Stack Setup

### WagmiConfig (`src/lib/wagmi-config.ts`)

Built with `getDefaultConfig` from RainbowKit. This single object is shared across the entire app.

```ts
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, bsc, ... } from "viem/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "...",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [...],
  ssr: true, // required for Next.js App Router
});
```

`ssr: true` is mandatory. Without it, hydration mismatches occur on wallet state.

### Providers (`src/app/providers.tsx`)

Must be a `"use client"` component. Provider nesting order is fixed:

```
WagmiProvider
  QueryClientProvider
    RainbowKitProvider
      {children}
```

`QueryClient` must be instantiated **outside** the component tree or with `useState` to survive re-renders without resetting the cache.

### Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Public | WalletConnect v2 project ID |
| `SESSION_SECRET` | Server-only | Session encryption key (min 32 chars) |

Never access `SESSION_SECRET` or any session logic in a `"use client"` component.

---

## Wallet Connection Flow

1. User clicks `<ConnectButton />` (RainbowKit) rendered inside a `"use client"` component.
2. RainbowKit opens its modal. It configures wagmi connectors (MetaMask injected, WalletConnect v2, Coinbase Wallet, etc.) automatically via `getDefaultConfig`.
3. On successful connection, wagmi stores connection state in its internal store (persisted via localStorage by default).
4. All wallet state is read via wagmi hooks:
   - Account address and connection status: `useConnection` (replaces deprecated `useAccount`)
   - Chain: `useChains` / `useSwitchChain`
   - Balance: `useBalance` from wagmi
   - Signing: `useSignMessage` or `useSignTypedData` from wagmi
5. **Never** read wallet state from RainbowKit directly. RainbowKit is UI only.

### `useConnection` return type (verified from `@wagmi/core` source)

```ts
{
  address:      Address | undefined   // first account address
  addresses:    readonly Address[] | undefined
  chain:        Chain | undefined     // matched chain object
  chainId:      number | undefined
  connector:    Connector | undefined
  isConnected:  boolean
  isConnecting: boolean
  isDisconnected: boolean
  isReconnecting: boolean
  status: 'connected' | 'reconnecting' | 'connecting' | 'disconnected'
}
```

`address` is `Address` (never `undefined`) only when `isConnected === true`. Always narrow on `isConnected` or `address !== undefined` before using the address.

### Wallet state access pattern

Always read from wagmi hooks in `"use client"` components or custom hooks inside `src/hooks/`. Never pass wallet state as props from a Server Component -- they cannot access it.

---

## SIWE Authentication Flow

SIWE (Sign-In With Ethereum) is distinct from wallet connection. A connected wallet is not an authenticated session.

### Flow overview

```
[Client] wallet connected
    |
    v
[Client] request nonce --> GET /api/auth/nonce
    |                           |
    |                      server generates nonce, stores in session
    |
    v
[Client] create SiweMessage with nonce, domain, address, chainId
    |
    v
[Client] sign message --> wagmi signMessage hook (returns signature)
    |
    v
[Client] POST /api/auth/verify { message, signature }
    |                               |
    |                          server verifies:
    |                            1. Parse SiweMessage
    |                            2. Verify signature cryptographically
    |                            3. Check nonce matches stored nonce
    |                            4. Check domain matches request origin
    |                            5. Check expiration time
    |                          on success: issue encrypted session cookie
    |
    v
[Client] session active -- server routes can read address from session
```

### Critical server-side verification rules

- **Verification happens exclusively on the server** (Route Handler). Never verify a SIWE signature on the client.
- **Nonce must be bound to the session** before being sent to the client. It must be consumed (deleted) after one successful verification to prevent replay attacks.
- **Domain check**: the `domain` field in `SiweMessage` must match the request's `Host` header. Reject mismatches.
- **Chain ID check**: verify that the `chainId` in the message is one of the app's supported chains.
- **Expiration**: set `expirationTime` when constructing `SiweMessage` on the client. Reject expired messages on the server.
- **Session cookie**: must be `HttpOnly`, `Secure` (in production), and `SameSite=Strict`. Use an encrypted session library (e.g. `iron-session`).

### SIWE vs wallet connection

| State | Where it lives | How to read it |
|---|---|---|
| Wallet connected | wagmi store (client) | wagmi hooks |
| SIWE session | encrypted HTTP cookie | Server Component or Route Handler |

Do not conflate these two. A user can disconnect their wallet without invalidating the SIWE session, and vice versa. Handle both states independently in the UI.

---

## Technical Constraints

1. **App Router only.** No `pages/` directory. No `getServerSideProps`, `getStaticProps`, or `_app.tsx`.
2. **`"use client"` is a boundary, not a default.** All components are Server Components unless explicitly marked. Mark the smallest possible subtree as client.
3. **wagmi hooks require a client context.** Any component calling a wagmi hook must be `"use client"` or a descendant of one.
4. **`ssr: true` in wagmiConfig is non-negotiable.** Removing it causes hydration errors.
5. **ABIs must be `as const`.** Without it, viem cannot infer types for `useReadContract` and `useWriteContract`.
6. **Do not install ethers.js.** viem is the low-level library. Use viem utilities (`formatUnits`, `parseUnits`, `getAddress`, etc.) directly.
7. **WalletConnect project ID must be provided at build time.** Missing `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` silently breaks WalletConnect connections.
8. **Tailwind v4 has no `tailwind.config.js`.** Configuration happens via CSS `@theme` directives in `globals.css` and PostCSS config only.
9. **React 19 concurrent features are active.** Avoid patterns that assume synchronous rendering.
10. **Route Handlers replace API routes.** Files must be `app/api/**/route.ts` exporting named HTTP method functions (`GET`, `POST`, etc.).
