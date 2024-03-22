'use server';

import { http, createConfig } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { readContract } from '@wagmi/core';
import { grantsAbi } from './abi';

const WILDCARD_DATA_ID = '0';

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export const getProjectGrants = async (address: string) => {
  try {
    const result = await readContract(config, {
      abi: grantsAbi,
      address: process.env.NEXT_GRANTS_ADDRESS as `0x${string}`,
      functionName: 'grantsFor',
      args: [address, WILDCARD_DATA_ID],
    });

    return result;
  } catch (error) {
    return error;
  }
};
