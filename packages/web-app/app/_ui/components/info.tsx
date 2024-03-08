'use client';

import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from './button';
import {
  useFetchCredentials,
  useFetchIdOSProfile,
  useIdOS,
} from '@/app/_providers/idos';

const IdosInfo = () => {
  const { data, isError, isLoading } = useFetchIdOSProfile();
  // const { data: credentials } = useFetchCredentials();

  console.log(
    '%c==>',
    'color: green; background: yellow; font-size: 20px',
    data,
    // credentials,
  );

  return <p>here</p>;
};

export function Info() {
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    blockTag: 'latest',
  });
  const { hasProfile, authenticate } = useIdOS();

  if (!account?.address) return null;

  return (
    <div className="grid grid-cols-1 gap-2">
      <h4 className="text-2xl font-bold">Wallet Info</h4>
      <p>Address: {account.address}</p>
      <p>ChainId: {account.chainId}</p>
      <p>Chain: {account.chain?.name}</p>
      <p>Status: {account.status}</p>
      <p>Connected: {account.isConnected}</p>
      <p>Network: {account.isDisconnected}</p>
      <p>
        Balance:{' '}
        {balance?.data?.formatted ? formatEther(balance?.data.value) : null}
      </p>
      {/* <p>HumanId: {humanId}</p> */}
      {hasProfile ? <IdosInfo /> : null}
      <div>
        <Button onClick={authenticate}>Check KYC status</Button>
      </div>
    </div>
  );
}
