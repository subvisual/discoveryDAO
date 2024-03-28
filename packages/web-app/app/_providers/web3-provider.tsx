'use client';

import { WagmiProvider } from 'wagmi';
import {
  RainbowKitProvider,
  lightTheme,
  type Theme,
} from '@rainbow-me/rainbowkit';
import { TChildren } from '@/app/_types';
import { nohemi } from '../_ui/fonts';
import merge from 'lodash.merge';
import { wagmiConfig } from './wagmi-config';

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
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider showRecentTransactions={true} theme={customTheme}>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
