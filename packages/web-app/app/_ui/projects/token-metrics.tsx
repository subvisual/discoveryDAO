import { Button } from '../components';

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
    <div className="flex w-full flex-col rounded-lg bg-white">
      <h4 className="border-b border-grey-lightest p-6 font-semibold uppercase">
        Token Metrics
      </h4>
      <div className="grid grid-cols-1 gap-12 p-6 md:grid-cols-2">
        <span>Token:</span>
        <span className="font-semibold">{token}</span>
        <span>Target Raise Range:</span>
        <span className="font-semibold">{targetRaiseRange}</span>
        <span>Total supply:</span>
        <span className="font-semibold">{totalSupply}</span>
        <span>Targeted date:</span>
        <span className="font-semibold">{displayDate}</span>
        <span>Contract Address:</span>
        <span className="font-semibold">{contractAddress}</span>
      </div>
      <Button className="rounded-none rounded-b-lg">Contribute</Button>
    </div>
  );
};
