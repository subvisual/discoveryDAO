import { idOS } from '@idos-network/idos-sdk';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAccount, useAccountEffect } from 'wagmi';
import { useEthersSigner } from './use-ethers-signer';
import { IdOSContext } from './context';
import { idOsConfig } from './config';
import { getProviderUrl } from './get-provider-url';

export const IdOsProvider = ({ children }: PropsWithChildren) => {
  const [hasProfile, setHasProfile] = useState(false);
  const [sdk, setSdk] = useState<idOS | null>(null);
  const ethSigner = useEthersSigner();
  const { address: userAddress, isConnected } = useAccount();

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

      // Authenticate by signing a message
      if (profile) {
        await sdk.setSigner('EVM', ethSigner);
        return;
      }
    };

    initialize();
  }, [ethSigner, userAddress, sdk]);

  const handleDisconnect = useCallback(async () => {
    await sdk?.reset({ enclave: true });
    setHasProfile(false);
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
      sdk,
      hasProfile,
      address: userAddress,
      getProviderUrl,
      reset: async () => {
        await sdk?.reset({ enclave: true });
      },
    };
  }, [sdk, hasProfile, userAddress]);

  return <IdOSContext.Provider value={state}>{children}</IdOSContext.Provider>;
};

export { useIdOS } from './context';
