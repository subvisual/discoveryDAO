/**
 * Module dependencies.
 */

import { ClaimActionCard } from './styles';
import { InfoCard } from './info-card';
import { LoadingModal } from './loading-modal';
import { currencyConfig } from 'src/core/constants';
import { formatCurrency } from 'src/core/utils/formatters';
import { media } from 'src/styles/breakpoints';
import { useClaim, useRefund, useVesting } from 'src/hooks/use-vesting';
import React, { useMemo } from 'react';
import styled from 'styled-components';

/**
 * `Grid` styled component.
 */

const Grid = styled.section`
  display: grid;
  grid-gap: 2.5rem;

  ${media.min.md`
    grid-gap: 1rem;
    grid-template-columns: 2fr 1fr 1fr;
  `}
`;

/**
 * Export `Vesting` component.
 */

export function Vesting() {
  const vestingState = useVesting();
  const { isPending: isRefundLoading, run: refund } = useRefund();
  const { isPending: isClaimLoading, run: claim } = useClaim();
  const { claimable, refundable, tokens, totalClaimed } = useMemo(
    () => ({
      claimable: formatCurrency(vestingState.claimable, currencyConfig.ctnd),
      refundable: formatCurrency(vestingState.refundable, currencyConfig.aUsd),
      tokens: formatCurrency(vestingState.tokens, currencyConfig.ctnd),
      totalClaimed: formatCurrency(
        vestingState.alreadyClaimed,
        currencyConfig.ctnd
      )
    }),
    [vestingState]
  );

  return (
    <Grid>
      <InfoCard
        nextRelease={vestingState.nextRelease}
        tokens={tokens}
        totalClaimed={totalClaimed}
      />

      <ClaimActionCard
        isDisabled={!vestingState.claimEnabled}
        onClick={claim}
        title={'Available to claim'}
        value={claimable}
      />

      <LoadingModal
        amount={claimable}
        isOpen={isClaimLoading}
        label={'Claimed value'}
      />

      {vestingState.refundEnabled && (
        <>
          <ClaimActionCard
            isDisabled={!vestingState.refundEnabled}
            onClick={refund}
            title={'Refund available'}
            value={refundable}
          />

          <LoadingModal
            amount={refundable}
            isOpen={isRefundLoading}
            label={'Refund after cap calculations'}
          />
        </>
      )}
    </Grid>
  );
}