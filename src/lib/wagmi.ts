import { http, createConfig } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [bsc],
  connectors: [injected()],
  transports: {
    [bsc.id]: http(process.env.NEXT_PUBLIC_BSC_RPC_URL),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
