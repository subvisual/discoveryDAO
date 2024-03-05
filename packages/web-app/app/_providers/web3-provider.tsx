'use client';

import { WagmiProvider } from 'wagmi';
import { foundry, mainnet } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { TChildren } from '@/app/_types';

const config = getDefaultConfig({
  appName: 'Boilerplate App',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  chains: [
    mainnet,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [foundry] : []),
  ],
  ssr: true,
  pollingInterval: 500,
});

export function Web3Provider({ children }: TChildren) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider showRecentTransactions={true}>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
