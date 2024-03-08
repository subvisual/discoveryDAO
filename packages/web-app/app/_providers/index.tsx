'use client';

import type { ReactNode } from 'react';
import { IdOsProvider } from './idos';
import { ReactQueryProviderWrapper } from './react-query-wrapper-provider';
import { Web3Provider } from './web3-provider';

type TProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: TProvidersProps) {
  return (
    <ReactQueryProviderWrapper>
      <Web3Provider>
        <IdOsProvider>{children}</IdOsProvider>
      </Web3Provider>
    </ReactQueryProviderWrapper>
  );
}
