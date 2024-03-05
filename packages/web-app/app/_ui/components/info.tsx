'use client';

import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useSession } from '@/app/_context/session';
import { Button } from './button';

export function Info() {
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    blockTag: 'latest',
  });
  const { humanId, authenticate } = useSession();

  //   console.log(
  //     '%c==>',
  //     'color: green; background: red; font-size: 20px',
  //     balance,
  //   );

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
      <p>HumanId: {humanId}</p>
      <div>
        <Button onClick={authenticate}>Check KYC status</Button>
      </div>
    </div>
  );
}
