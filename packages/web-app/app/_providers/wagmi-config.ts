import { foundry, mainnet, sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const wagmiConfig = getDefaultConfig({
  appName: 'Citizend',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  chains: [
    mainnet,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
      ? [foundry, sepolia]
      : []),
  ],
  ssr: true,
  pollingInterval: 500,
});
