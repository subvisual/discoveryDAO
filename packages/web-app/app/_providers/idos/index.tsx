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
  const [hasSigned, setHasSigned] = useState(false);
  const [sdk, setSdk] = useState<idOS | null>(null);
  const ethSigner = useEthersSigner();
  const { address: userAddress, isConnected } = useAccount();

  const authenticate = useCallback(async () => {
    if (!ethSigner || !sdk || !userAddress) return;

    const _profile = await sdk.hasProfile(userAddress);

    if (!_profile) {
      // window.open(
      //   getProviderUrl(ethSigner.address),
      //   '_blank',
      //   'noopener,noreferrer',
      // );

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

      // Authenticate
      if (profile) {
        setHasProfile(true);
        await sdk.setSigner('EVM', ethSigner);
        setHasSigned(true);
        return;
      }

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
      sdk,
      hasProfile,
      address: userAddress,
      hasSigned,
      authenticate,
      getProviderUrl,
      reset: async () => {
        await sdk?.reset({ enclave: true });
      },
    };
  }, [sdk, hasProfile, hasSigned, userAddress, authenticate]);

  return <IdOSContext.Provider value={state}>{children}</IdOSContext.Provider>;
};

export { useIdOS } from './context';
