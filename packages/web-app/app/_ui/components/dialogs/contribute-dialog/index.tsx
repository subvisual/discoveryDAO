'use client';

import { useCtzndPaymentTokenAllowance, useEffectSafe } from '@/app/_lib/hooks';
import { Dialog } from '@headlessui/react';
import { formatEther } from 'viem';
import {
  useBuyCtzndTokens,
  useSetPaymentTokenAllowance,
} from '@/app/_lib/actions';
import { Spinner } from '../../svg/spinner';
import { useTransaction } from 'wagmi';
import { sepolia } from 'viem/chains';
import { Check } from '../../svg/check';
import Link from 'next/link';
import { Error } from '../../svg/error';

const Done = ({ hash }: { hash: `0x${string}` }) => {
  const { data } = useTransaction({
    hash,
    chainId: sepolia.id,
    query: {
      staleTime: 0,
      refetchInterval: 1000,
      refetchIntervalInBackground: true,
    },
  });

  if (data?.blockHash) {
    return (
      <Link
        href={`https://sepolia.etherscan.io/tx/${hash}`}
        target="_blank"
        className="text-blue-500"
      >
        View on etherscan
      </Link>
    );
  }

  return (
    <div className="flex content-center items-center justify-center gap-1">
      <Spinner className="h-5 w-5 text-blue-500" />
      <Link
        href={`https://sepolia.etherscan.io/tx/${hash}`}
        target="_blank"
        className="text-blue-500"
      >
        Validating Transaction
      </Link>
    </div>
  );
};

type TAllowFundsProps = {
  amount: number;
  amountInWei: bigint;
  allowance: bigint;
};

const AllowFunds = ({ amountInWei, allowance }: TAllowFundsProps) => {
  const { error, setAllowance, isPending, allowanceTxHash } =
    useSetPaymentTokenAllowance();

  useEffectSafe(() => {
    if (allowanceTxHash) return;

    setAllowance(amountInWei);
  }, []);

  if (allowanceTxHash) {
    return (
      <>
        <Check className="h-8 w-8 text-blue-500" />
        Allowance submitted
        <div className="text-sm">
          <Done hash={allowanceTxHash} />
        </div>
      </>
    );
  }

  if (error) {
    const errorMessage = error as unknown as any;
    return (
      <>
        <Error className="h-8 w-8 text-red-700" />
        <div>Failed</div>
        <div className="flex text-sm">
          {errorMessage?.shortMessage || "Couldn't submit allowance"}
        </div>
      </>
    );
  }

  return (
    <>
      <Spinner className="h-8 w-8 text-blue-500" />
      Proceed in your wallet
    </>
  );
};

type TContributeProps = {
  tokensToBuyInWei: bigint;
  contributionTxHash?: `0x${string}`;
  buyCtzndTokens: (tokensToBuyInWei: bigint) => void;
  error: any;
};

const Contribute = ({
  tokensToBuyInWei,
  contributionTxHash,
  buyCtzndTokens,
  error,
}: TContributeProps) => {
  useEffectSafe(() => {
    if (!tokensToBuyInWei || contributionTxHash) return;

    buyCtzndTokens(tokensToBuyInWei);
  }, []);

  if (contributionTxHash) {
    return (
      <>
        <Check className="h-8 w-8 text-blue-500" />
        Contribution submitted
        <div className="text-sm">
          <Done hash={contributionTxHash} />
        </div>
      </>
    );
  }

  if (error) {
    const errorMessage = error as unknown as any;
    return (
      <>
        <Error className="h-8 w-8 text-red-700" />
        <div>Failed</div>
        <div className="flex text-sm">
          {errorMessage?.shortMessage || "Couldn't submit contribution"}
        </div>
      </>
    );
  }

  return (
    <>
      <Spinner className="h-8 w-8 text-blue-500" />
      Proceed in your wallet
    </>
  );
};

type TDescriptionProps = {
  amount: number;
  tokensToBuy: number;
};

const Description = ({ amount, tokensToBuy }: TDescriptionProps) => (
  <div className="my-6 flex flex-col gap-6 border-b border-t border-mono-200 py-6 text-sm">
    <div className="flex justify-between">
      <div className="uppercase text-mono-800">My Contribution</div>
      <div className="text-mono-950">{amount} USDC</div>
    </div>
    <div className="flex justify-between">
      <div className="uppercase text-mono-800">CTND Amount</div>
      <div className="text-mono-950">{tokensToBuy} CTND</div>
    </div>
  </div>
);

export type TContributeDialogProps = {
  userAddress: `0x${string}`;
  amount: number;
  tokensToBuy: number;
  amountInWei: bigint;
  tokensToBuyInWei: bigint;
};

export function ContributeDialog({
  userAddress,
  amount,
  tokensToBuy,
  amountInWei,
  tokensToBuyInWei,
}: TContributeDialogProps) {
  const { allowance, isLoading, error } =
    useCtzndPaymentTokenAllowance(userAddress);
  const {
    contributionTxHash,
    buyCtzndTokens,
    error: buyError,
  } = useBuyCtzndTokens();

  if (isLoading && !allowance)
    return (
      <div>
        <Spinner />
      </div>
    );
  if (error || allowance === undefined) return <div>{error?.message}</div>;

  const hasEnoughAllowance = allowance && allowance >= amountInWei;
  if (hasEnoughAllowance || contributionTxHash)
    return (
      <>
        <Dialog.Title
          as="h2"
          className="relative flex w-full flex-col items-center justify-center gap-4 p-8 text-mono-950"
        >
          <Contribute
            tokensToBuyInWei={tokensToBuyInWei}
            contributionTxHash={contributionTxHash}
            buyCtzndTokens={buyCtzndTokens}
            error={buyError}
          />
        </Dialog.Title>
        <div className="-mt-6 flex flex-col">
          <Description amount={amount} tokensToBuy={tokensToBuy} />
          <p className="text-sm">
            Keep in mind that if you want to contribute again, you’ll need to
            use the same wallet.
          </p>
        </div>
      </>
    );

  return (
    <>
      <Dialog.Title
        as="h2"
        className="relative flex w-full flex-col items-center justify-center gap-4 p-8 text-mono-950"
      >
        <AllowFunds
          amount={amount}
          allowance={allowance}
          amountInWei={amountInWei}
        />
      </Dialog.Title>
      <p>
        In order to contribute to this project, you need to allow the app to
        withdraw you USDC funds.
      </p>
      <br />
      <p>
        Please make sure you allow at least the amount you wish to contribute (
        {amount} USDC).
      </p>
      <div className="flex flex-col">
        <Description amount={amount} tokensToBuy={tokensToBuy} />
        <div className="flex justify-between pb-6 text-sm">
          <div className="uppercase text-mono-800">Current allowed value:</div>
          <div className="text-mono-950">
            {allowance ? formatEther(allowance) : 0} USDC
          </div>
        </div>
      </div>
    </>
  );
}

ContributeDialog.displayName = 'contributeDialog';