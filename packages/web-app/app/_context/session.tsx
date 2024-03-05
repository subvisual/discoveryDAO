'use client';

import {
  Context,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAccount, useAccountEffect } from 'wagmi';
import { idOS } from '@idos-network/idos-sdk';
import { useEthersSigner } from './utils';
import { JsonRpcSigner } from 'ethers';

type TProps = {
  children: ReactNode;
};

interface AuthUser {
  humanId?: string;
  address?: string;
  publicKey?: string;
}

type TSession = {
  active: boolean;
  humanId?: string;
  authenticate: () => void;
};

const SessionContext: Context<TSession> = createContext({} as TSession);

export function useSession(): TSession {
  return useContext(SessionContext);
}

const getCurrentUser = async (
  idos: idOS,
  signer: JsonRpcSigner,
): Promise<AuthUser | undefined> => {
  try {
    return await idos.auth.currentUser();
  } catch (error) {
    // not signed yet
  }

  try {
    const _signer = await idos.auth.setEvmSigner(signer);

    return await idos.auth.currentUser();
  } catch (error) {
    console.log(error);
  }
};

export function SessionProvider({ children }: TProps) {
  const account = useAccount();
  const signer = useEthersSigner();
  const [signed, setSigned] = useState(false);
  const idos = useRef<idOS>();
  const [humanId, setHumanId] = useState<string | undefined>();

  const authenticate = useCallback(async () => {
    if (!signer) return;

    if (!idos.current) {
      const ref = await idOS.init({ container: '#idos' });
      idos.current = ref;
    }

    const user = await getCurrentUser(idos.current, signer);
    if (user) {
      setHumanId(user.humanId);
    }
    const credentials = await idos.current.data.list('credentials');
    console.log(
      '%c==>',
      'color: green; background: yellow; font-size: 20px',
      credentials,
    );
  }, [signer]);

  useAccountEffect({
    onConnect(data) {
      const startVerification = async () => {
        if (!signer) return;

        if (!idos.current) {
          const ref = await idOS.init({ container: '#idos' });
          idos.current = ref;
        }

        const hasProfile = await idos.current.hasProfile(signer.address);

        if (!hasProfile) {
          return window.open(
            idOS.profileProviders[0],
            '_blank',
            'noopener,noreferrer',
          );
        }

        const user = await getCurrentUser(idos.current, signer);

        if (user) {
          setHumanId(user.humanId);
        }
      };

      startVerification();
    },
    onDisconnect() {
      setHumanId(undefined);
    },
  });

  const sessionState = useMemo(
    () => ({
      active: !!account.address,
      humanId,
      authenticate,
    }),
    [account?.address, humanId, authenticate],
  );

  return (
    <SessionContext.Provider value={sessionState}>
      {children}
    </SessionContext.Provider>
  );
}
