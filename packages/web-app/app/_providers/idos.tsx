import { idOS } from '@idos-network/idos-sdk';
import { useQuery } from '@tanstack/react-query';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAccount, useAccountEffect } from 'wagmi';
import { useEthersSigner } from './utils';

type idOSContextValue = {
  sdk: idOS | null;
  address: string | undefined;
  hasProfile: boolean;
  isConnected: boolean;
  authenticate: () => Promise<void>;
  reset: () => Promise<void>;
};

const getAuthUrl = (address: string) => {
  const base = process.env.NEXT_PUBLIC_PROFILE_PROVIDER_TEST_BASE;
  const idOs = '%20verification.idos%3Aread%20verification.idos.details%3Aread';
  const livenessCheck =
    '%20verification.liveness%3Aread%20verification.liveness.details%3Aread';
  const ethWallet =
    '%20verification.wallet-eth%3Aread%20verification.wallet-eth.details%3Aread';
  const ensureWallet = '&ensure_wallet=';

  return base + idOs + livenessCheck + ethWallet + ensureWallet + address;
};

const idOSContext = createContext<idOSContextValue | null>(null);

export const useIdOS = () => {
  const idos = useContext(idOSContext);

  if (!idos) {
    throw new Error('idOS is not initialized');
  }

  return idos;
};

export const useFetchIdOSProfile = () => {
  const { sdk } = useIdOS();
  return useQuery({
    queryKey: ['idos-profile'],
    queryFn: () => sdk?.auth?.currentUser(),
  });
};

export const useFetchCredentials = () => {
  const { sdk } = useIdOS();

  return useQuery({
    queryKey: ['credentials'],
    queryFn: () => sdk?.data.list('credentials'),
  });
};

export const IdOsProvider = ({ children }: PropsWithChildren) => {
  const [hasProfile, setHasProfile] = useState(false);
  const [sdk, setSdk] = useState<idOS | null>(null);
  const ethSigner = useEthersSigner();
  const { address: userAddress, isConnected } = useAccount();
  const sdkRef = useRef<idOS | null>(null);

  const authenticate = useCallback(async () => {
    if (!ethSigner || !sdk) return;

    await sdk.setSigner('EVM', ethSigner);
    const user = await sdk.auth.currentUser();
    console.log(
      '%c==> current user',
      'color: green; background: yellow; font-size: 12px',
      user,
    );
    if (!hasProfile) {
      window.open(
        getAuthUrl(ethSigner.address),
        '_blank',
        'noopener,noreferrer',
      );
    }
  }, [ethSigner, sdk, hasProfile]);

  // Load SDK once wallet is connected
  useEffect(() => {
    const loadSdk = async () => {
      const ref = await idOS.init({ container: '#idos' });
      sdkRef.current = ref;
      setSdk(ref);
    };
    if (isConnected && !sdk) {
      loadSdk();
    }
  }, [isConnected, sdk]);

  // Initialize user once SDK is loaded
  useEffect(() => {
    const initialize = async () => {
      if (!ethSigner || !userAddress || !sdk) return;

      const profile = await sdk.hasProfile(userAddress);
      console.log(
        '%c==> hasProfile?',
        'color: green; background: black; font-size: 12px',
        userAddress,
        '=>',
        profile,
      );
      setHasProfile(profile);

      if (profile) {
        // await _sdk.setSigner('EVM', signer);
      }
    };

    initialize();
  }, [ethSigner, userAddress, sdk]);

  const handleDisconnect = useCallback(async () => {
    await sdk?.reset({ enclave: true });
    // setSdk(null);
  }, [sdk]);

  useAccountEffect({
    onConnect(data) {
      // if (data?.address) {
      //   setIsConnected(true);
      // }
    },
    onDisconnect() {
      // setHumanId(undefined);
      // setIsConnected(false);
      handleDisconnect();
    },
  });

  const state = useMemo(() => {
    return {
      sdk: sdk,
      hasProfile,
      address: userAddress,
      isConnected,
      authenticate,
      reset: async () => {
        await sdk?.reset({ enclave: true });
      },
    };
  }, [sdk, hasProfile, userAddress, isConnected, authenticate]);

  return <idOSContext.Provider value={state}>{children}</idOSContext.Provider>;
};
