import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import type { Account, Chain, Client, Transport } from 'viem';
import { type Config, useConnectorClient } from 'wagmi';

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

// /** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();

  useEffect(() => {
    const loadClient = async () => {
      if (client) {
        const signerResult = await clientToSigner(client);
        setSigner(signerResult);
      }
    };
    loadClient();

    return () => {
      setSigner(undefined);
    };
  }, [client]);

  return signer;
}
