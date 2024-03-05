'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from '../_context/session';
import { ReactQueryProviderWrapper } from './react-query-wrapper-provider';
import { Web3Provider } from './web3-provider';

type TProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: TProvidersProps) {
  return (
    <ReactQueryProviderWrapper>
      <Web3Provider>
        <SessionProvider>{children}</SessionProvider>
      </Web3Provider>
    </ReactQueryProviderWrapper>
  );
}
