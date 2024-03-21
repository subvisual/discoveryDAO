import { Button } from '../components';
import { ContributeButton } from './contribute-button';

type TTokenMetricsProps = {
  token: string;
  targetRaiseRange: string;
  totalSupply: string;
  targetedDate: Date;
  contractAddress: string;
};

export const TokenMetrics = ({
  token,
  targetRaiseRange,
  totalSupply,
  targetedDate,
  contractAddress,
}: TTokenMetricsProps) => {
  const displayDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(targetedDate);

  return (
    <div className="flex w-full flex-col rounded-lg bg-white-anti-flash">
      <h4 className="border-b border-grey-lightest p-6 font-medium uppercase">
        Token Metrics
      </h4>
      <div className="grid grid-cols-1 gap-12 p-6 md:grid-cols-2">
        <span>Token:</span>
        <span className="font-medium">{token}</span>
        <span>Target Raise Range:</span>
        <span className="font-medium">{targetRaiseRange}</span>
        <span>Total supply:</span>
        <span className="font-medium">{totalSupply}</span>
        <span>Targeted date:</span>
        <span className="font-medium">{displayDate}</span>
        <span>Contract Address:</span>
        <span className="font-medium">{contractAddress}</span>
      </div>
      <ContributeButton />
    </div>
  );
};
