import { idOS } from '@idos-network/idos-sdk';
import { createContext, useContext } from 'react';

type TIdOSContextValue = {
  sdk: idOS | null;
  address: string | undefined;
  hasProfile: boolean;
  hasSigned: boolean;
  authenticate: () => Promise<void>;
  reset: () => Promise<void>;
};

export const IdOSContext = createContext<TIdOSContextValue | null>(null);

export const useIdOS = () => {
  const idos = useContext(IdOSContext);

  if (!idos) {
    throw new Error('idOS is not initialized');
  }

  return idos;
};
