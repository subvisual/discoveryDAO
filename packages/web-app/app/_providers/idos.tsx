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
import { idOSCredential } from '../_types/idos';

type idOSContextValue = {
  sdk: idOS | null;
  address: string | undefined;
  hasProfile: boolean;
  hasSigned: boolean;
  authenticate: () => Promise<void>;
  reset: () => Promise<void>;
};

const idOsConfig = {
  container: '#idos',
  nodeUrl: process.env.NEXT_PUBLIC_IDOS_NODE_URL,
  dbId: process.env.NEXT_PUBLIC_IDOS_DB_ID,
  evmGrantsOptions: {
    contractAddress: process.env.NEXT_PUBLIC_IDOS_CONTRACT_ADDRESS,
    chainId: process.env.NEXT_PUBLIC_IDOS_CHAIN_ID,
  },
};

const providerBaseUrl = process.env.NEXT_PUBLIC_PROFILE_PROVIDER_TEST_BASE;
const providerIdosCheck =
  '%20verification.idos%3Aread%20verification.idos.details%3Aread';
const providerLivenessCheck =
  '%20verification.liveness%3Aread%20verification.liveness.details%3Aread';
const providerEthWalletCheck =
  '%20verification.wallet-eth%3Aread%20verification.wallet-eth.details%3Aread';
const providerEnsureWalletCheck = '&ensure_wallet=';

const getProviderUrl = (address: string) => {
  return (
    providerBaseUrl +
    providerIdosCheck +
    providerLivenessCheck +
    providerEthWalletCheck +
    providerEnsureWalletCheck +
    address
  );
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
    queryFn: async ({ queryKey: [tableName] }) => {
      if (!sdk) return [];

      const credentials = await sdk.data.list<idOSCredential>(tableName);
      return credentials.map((credential) => ({
        ...credential,
        shares: credentials
          .filter((_credential) => _credential.original_id === credential.id)
          .map((c) => c.id),
      }));
    },
    select: (credentials) =>
      credentials.filter((credential) => !credential.original_id),
  });
};

export const useFetchWallets = () => {
  const { sdk } = useIdOS();

  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => sdk?.data.list('wallets'),
  });
};

export const useFetchGrants = () => {
  const { sdk } = useIdOS();
  const { address } = useAccount();

  return useQuery({
    queryKey: ['grants', address],
    queryFn: () => sdk?.grants.list({ owner: address }),
  });
};

export const IdOsProvider = ({ children }: PropsWithChildren) => {
  const [hasProfile, setHasProfile] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [sdk, setSdk] = useState<idOS | null>(null);
  const ethSigner = useEthersSigner();
  const { address: userAddress, isConnected } = useAccount();

  const authenticate = useCallback(async () => {
    if (!ethSigner || !sdk || !userAddress) return;

    const _profile = await sdk.hasProfile(userAddress);

    if (!_profile) {
      window.open(
        getProviderUrl(ethSigner.address),
        '_blank',
        'noopener,noreferrer',
      );

      return;
    }

    await sdk.setSigner('EVM', ethSigner);

    setHasProfile(true);
    setHasSigned(true);
  }, [ethSigner, sdk, userAddress]);

  // Load SDK once wallet is connected
  useEffect(() => {
    const loadSdk = async () => {
      const ref = await idOS.init(idOsConfig);
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

      setHasProfile(profile);
    };

    initialize();
  }, [ethSigner, userAddress, sdk]);

  const handleDisconnect = useCallback(async () => {
    await sdk?.reset({ enclave: true });
    setHasProfile(false);
    setHasSigned(false);
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
      hasSigned,
      authenticate,
      reset: async () => {
        await sdk?.reset({ enclave: true });
      },
    };
  }, [sdk, hasProfile, hasSigned, userAddress, authenticate]);

  return <idOSContext.Provider value={state}>{children}</idOSContext.Provider>;
};
