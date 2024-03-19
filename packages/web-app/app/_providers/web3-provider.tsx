'use client';

import { WagmiProvider } from 'wagmi';
import { foundry, mainnet, sepolia } from 'wagmi/chains';
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
  type Theme,
} from '@rainbow-me/rainbowkit';
import { TChildren } from '@/app/_types';
import { nohemi } from '../_ui/fonts';
import merge from 'lodash.merge';

const config = getDefaultConfig({
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

const customTheme = merge(
  lightTheme({
    overlayBlur: 'small',
    accentColor: '#3F69F5',
    accentColorForeground: '#FFF',
  }),
  {
    fonts: {
      body: nohemi.style.fontFamily,
    },
  },
) as Theme;

export function Web3Provider({ children }: TChildren) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider showRecentTransactions={true} theme={customTheme}>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
