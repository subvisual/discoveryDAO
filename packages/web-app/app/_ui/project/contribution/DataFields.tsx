import {
  useReadCtzndSaleMaxTarget,
  useReadCtzndSaleTotalTokensForSale,
} from '@/wagmi.generated';
import { formatEther } from 'viem';
import { number } from '../../utils/intl-formaters/number';
import { useCtzndMinContributionUsdc } from '@/app/_lib/queries';
import { useTotalInvestedUsdcCtznd } from '@/app/_lib/queries';
import { calculateTokenPrice } from '../../utils/calculateTokenPrice';
import { usdValue } from '../../utils/intl-formaters/usd-value';
import { Tooltip } from '../../components/tooltip';

const useMaxParticipants = () => {
  const { data: maxTarget, isLoading: targetLoading } =
    useReadCtzndSaleMaxTarget();
  const min = useCtzndMinContributionUsdc();
  const targetValue = maxTarget ? Number(formatEther(maxTarget)) : undefined;
  const minValue = min ? Number(min) : undefined;

  return {
    data: !targetValue || !minValue ? undefined : targetValue / minValue,
    isLoading: targetLoading,
  };
};

const LoadingField = () => (
  <div className="h-5 w-full animate-pulse rounded-md bg-gradient-to-br from-mono-50 to-mono-200" />
);

export const DataFields = () => {
  const { data: totalTokensForSale } = useReadCtzndSaleTotalTokensForSale();
  const minContribution = useCtzndMinContributionUsdc();
  const { data: maxParticipants } = useMaxParticipants();
  const totalContributions = useTotalInvestedUsdcCtznd();
  const currentTokenPrice = calculateTokenPrice(Number(totalContributions));

  return (
    <div className="flex flex-col gap-6 border-t border-mono-200 p-4 md:p-6">
      <div className="grid grid-cols-1 gap-x-2 gap-y-1 md:grid-cols-2">
        <span className="text-mono-800">Current price/Token (FDV):</span>
        <div className="md:text-end">
          <span>{usdValue(currentTokenPrice)} </span>
          <span className="text-mono-800">{`($${currentTokenPrice * 100}m)`}</span>
        </div>
        <span className="text-sm text-mono-800">Price range (FDV range):</span>
        <div className="text-sm md:text-end">
          <span>$0.2 - $0.4 </span>
          <span className="text-mono-800">($20m - $40m)</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-2 gap-y-1 md:grid-cols-2">
        <span className="text-mono-800">Tokens distributed:</span>
        <div className="md:text-end">
          {totalTokensForSale !== undefined ? (
            <>{number(Number(formatEther(totalTokensForSale)))} CTND</>
          ) : (
            <LoadingField />
          )}
        </div>
        <span className="text-sm text-mono-800">(% of total supply):</span>
        <div className="text-sm md:text-end">
          <span className="text-mono-800">(2.5%)</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:justify-between">
        <span className="text-mono-800">Min. contribution amount:</span>
        <span className="md:text-end">{minContribution} USDC</span>
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:justify-between">
        <span className="relative text-mono-800">
          Max. number of participants:
          <div className="absolute -right-4 -top-2">
            <Tooltip
              text="Sale will close automatically after reaching this amount"
              className="-translate-x-3/4 -translate-y-full"
            />
          </div>
        </span>
        <span className="md:text-end">
          {maxParticipants !== undefined ? (
            number(maxParticipants)
          ) : (
            <LoadingField />
          )}
        </span>
      </div>
    </div>
  );
};
