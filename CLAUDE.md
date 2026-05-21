@AGENTS.md

---

# Claude Code Rules

## Before Writing Any Code

1. Read `node_modules/next/dist/docs/` for the current Next.js API.
2. For wagmi or viem APIs, check `node_modules/wagmi/dist/` or use context7 MCP (`mcp__context7__resolve-library-id` then `mcp__context7__query-docs`). Training data reflects wagmi v2; this project uses v3.
3. For RainbowKit, check `node_modules/@rainbow-me/rainbowkit/dist/`.

---

## Next.js App Router Rules

- **Never create a `pages/` directory.** All routes live under `src/app/`.
- **Never use Pages Router APIs:** `getServerSideProps`, `getStaticProps`, `getInitialProps`, `_app.tsx`, `_document.tsx`, `useRouter` from `next/router` (use `next/navigation` instead).
- **Default to Server Components.** Only add `"use client"` when the component uses hooks, browser APIs, or event handlers.
- **Keep `"use client"` boundaries as small as possible.** Extract interactive parts into leaf components rather than marking entire route segments as client.
- **Data fetching in Server Components** uses `fetch` (with Next.js caching semantics) or direct DB/ORM calls -- not wagmi or any React hook.
- **Route Handlers** (`app/api/**/route.ts`) replace API routes. Export named functions `GET`, `POST`, `PUT`, `DELETE`, `PATCH`. Never use `req.method` switches.
- **Layouts are Server Components.** Do not put wagmi hooks or `"use client"` logic directly in `layout.tsx`. Use the `<Providers>` wrapper pattern already in place.
- **`next/image`** over `<img>`. **`next/link`** over `<a>` for internal navigation.

---

## wagmi Rules

- **Hooks only.** Never call viem actions directly inside React components. Use the wagmi React hooks layer (`useReadContract`, `useWriteContract`, `useBalance`, `useSignMessage`, etc.).
- **Never import from `ethers` or `@ethersproject/`.** viem is the only low-level library.
- **Encapsulate all wagmi logic in `src/hooks/`.** UI components in `src/components/` must not import from `wagmi` directly -- they receive data as props or consume custom hooks.
- **Typed contract calls require `as const` ABIs.** All files in `src/abis/` must export arrays with `as const`.
- **`query.enabled` guards are mandatory** when a contract call depends on an address or token address that may be undefined. Never let a call fire with `undefined` args.
- **Do not create multiple `QueryClient` instances.** The single instance in `src/app/providers.tsx` is shared by the entire app.
- **Do not instantiate `wagmiConfig` more than once.** Import from `src/lib/wagmi-config.ts`.
- **`useAccount` is deprecated in wagmi v3.** Use `useConnection` for account address and connection status. Similarly: `useAccountEffect` -> `useConnectionEffect`, `useSwitchAccount` -> `useSwitchConnection`. Never use the v2 names.
- **Connector/chain arrays were removed from several hooks.** Use `useConnectors()` instead of `useConnect().connectors`, and `useChains()` instead of `useSwitchChain().chains`.

---

## RainbowKit Rules

- **`<ConnectButton />`** is the only supported entry point for wallet connection UI. Do not build a custom connect button that bypasses RainbowKit's modal.
- **RainbowKit is UI only.** Never read wallet state from RainbowKit APIs. Use wagmi hooks for address, chain, and connection status.
- **`@rainbow-me/rainbowkit/styles.css` must be imported** exactly once, in `src/app/providers.tsx`.
- **Do not nest `<RainbowKitProvider>` inside a component that re-mounts frequently.** It lives at the root level in `<Providers>`.
- **`getDefaultConfig` wires WalletConnect v2 automatically** via the `projectId` option. Do not manually configure WalletConnect connectors alongside it -- they will conflict.
- **Chain list lives in `src/lib/wagmi-config.ts` only.** Never hardcode chain IDs elsewhere; import from `viem/chains`.

---

## SIWE Security Rules

- **Signature verification is server-side only.** No SIWE verification logic in `"use client"` components or custom hooks.
- **Nonce lifecycle:** generate on the server (GET `/api/auth/nonce`), bind to the session immediately, consume after one successful verify. A nonce must never be reused.
- **Domain binding:** when constructing `SiweMessage`, `domain` must equal `window.location.host`. On the server, reject messages where `domain` does not match the request's `Host` header.
- **Set `expirationTime`** when building the SIWE message on the client (e.g. 5 minutes). Reject expired messages server-side.
- **Session cookies:** `HttpOnly`, `Secure` in production, `SameSite=Strict`. Use `iron-session` or equivalent -- never plain JWTs in localStorage.
- **Never return the raw session secret to the client.** `SESSION_SECRET` is server-only and must not be referenced in any `"use client"` file.
- **Wallet disconnection does not invalidate the session.** Implement an explicit logout endpoint (POST `/api/auth/logout`) that destroys the session cookie.
- **Treat wallet-connected and SIWE-authenticated as independent states.** Gate server actions on the session, not on wagmi connection state.

---

## Code Style

- **TypeScript strict mode.** No `any`, no `// @ts-ignore` without a documented reason.
- **No comments** unless the reason is non-obvious to a future reader. Never explain what the code does; only explain hidden constraints or surprising invariants.
- **No ethers.js types.** Use viem types: `Address` (`0x${string}`), `Hash`, `Hex`, `Log`, etc.
- **Format numbers from on-chain data with `formatUnits` from viem.** Never do manual division by powers of 10.
- **Prefer named exports** over default exports for components, hooks, and utilities. Default exports are acceptable only for Next.js pages and layouts (framework requirement).
- **Co-locate component logic.** A `"use client"` component that fetches data via a custom hook and renders it is a valid, complete file -- no forced separation into container/presenter.
- **No barrel `index.ts` files** unless the folder contains more than five exports that are all intended for external use.
- **Environment variable access:** `NEXT_PUBLIC_*` may be read anywhere; server-only vars must only be accessed inside Route Handlers, Server Components, or `lib/` files that are never imported by client components.
- **Tailwind v4 only.** No inline `style` props for layout or spacing. No `tailwind.config.js` modifications -- use CSS `@theme` in `globals.css`.
