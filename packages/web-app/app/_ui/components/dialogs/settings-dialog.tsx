'use client';

import { Dialog } from '@headlessui/react';
import { Button } from '..';
import { useDialog } from '@/app/_providers/dialog/context';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { formatEther } from 'viem';
import { useIdOS } from '@/app/_providers/idos';
import Link from 'next/link';
import { useFetchKycCredential } from '@/app/_lib/queries';

type TCloseProps = {
  onClick: () => void;
};

const Close = ({ onClick }: TCloseProps) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-0 h-6 w-6 hover:text-grey"
      aria-hidden="true"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.4002 12L4 5.59977L5.59977 4L12 10.4002L18.4002 4L20 5.59977L13.5998 12L20 18.4002L18.4002 20L12 13.5998L5.59977 20L4 18.4002L10.4002 12Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

const Credentials = () => {
  const { isLoading, approved } = useFetchKycCredential();

  if (isLoading) return <div>Loading...</div>;

  if (approved) return <div>Verified</div>;

  return <div>Awaiting Approval</div>;
};

const Status = () => {
  const { hasProfile, getProviderUrl, address } = useIdOS();

  if (!address) return;

  if (!hasProfile) {
    return <Link href={getProviderUrl(address)}>Verify my ID</Link>;
  }

  return <Credentials />;
};

export function SettingsDialog() {
  const { close } = useDialog();
  const { address } = useAccount();
  const balance = useBalance({
    address: address,
    blockTag: 'latest',
  });
  const { disconnect } = useDisconnect();

  return (
    <>
      <Dialog.Title
        as="h4"
        className="relative flex w-full justify-center text-navy-dark"
      >
        <div className="">Settings</div>
        <Close onClick={close} />
      </Dialog.Title>
      <div className="flex flex-col items-start gap-4">
        <p className="max-w-full overflow-hidden">Account: {address}</p>
        <p>
          Balance:{' '}
          {balance?.data?.formatted ? formatEther(balance?.data.value) : null}{' '}
          {balance.data?.symbol}
        </p>
        <Status />
      </div>
      <Button
        onClick={() => {
          disconnect();
          close();
        }}
      >
        Disconnect
      </Button>
      {/* <div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title as="h3" className="text-gray-900">
            Verify your ID
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              To be able to Contribue to this project, you must complete ID
              basic verification.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center sm:mt-6">
        <Button>Check KYC status</Button>
        <Button variant="secondary" className="mt-3" onClick={close}>
          Skip for now
        </Button>
      </div> */}
    </>
  );
}

SettingsDialog.displayName = 'settingsDialog';
