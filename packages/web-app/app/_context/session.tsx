'use client';

import {
  Context,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAccount, useAccountEffect } from 'wagmi';
import { idOS } from '@idos-network/idos-sdk';
import { useEthersSigner } from './useEtherSigner';
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
  //   onLogout: () => void;
};

const SessionContext: Context<TSession> = createContext({} as TSession);

export function useSession(): TSession {
  return useContext(SessionContext);
}

const getStoredAddresses = () => {
  try {
    return JSON.parse(window.localStorage.getItem('addresses') || '') ?? [];
  } catch (error) {
    return [];
  }
};

const setStoredAddresses = (addresses: string[]) => {
  window.localStorage.setItem('addresses', JSON.stringify(addresses));
};

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

  //   setAddresses((addresses) => {
  //     const allAddresses = [...addresses, signer.address];

  //     setStoredAddresses(allAddresses);

  //     return allAddresses;
  //   });
};

export function SessionProvider({ children }: TProps) {
  const account = useAccount();
  const signer = useEthersSigner();
  const [signed, setSigned] = useState(false);
  //   const [addresses, setAddresses] = useState<string[]>(getStoredAddresses);
  const idos = useRef<idOS>();
  const [humanId, setHumanId] = useState<string | undefined>();
  //   console.log(
  //     '%c==>',
  //     'color: green; background: pink; font-size: 20px',
  //     account,
  //   );

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

        // const user = await getCurrentUser(idos.current, signer);
        // if (user) {
        //   setHumanId(user.humanId);
        // }

        const hasProfile = await idos.current.hasProfile(signer.address);

        if (!hasProfile) {
          // window.location = idOS.profileProviders[0];
          window.open(
            idOS.profileProviders[0],
            '_blank',
            'noopener,noreferrer',
          );
        }
      };

      startVerification();
    },
    onDisconnect() {
      console.log(
        '%c==>',
        'color: green; background: yellow; font-size: 20px',
        'CLEAR',
      );

      //   setAddresses([]);
      //   window.localStorage.clear();
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
