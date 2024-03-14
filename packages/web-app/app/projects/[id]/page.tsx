'use client';

import Image from 'next/image';
import { Button, Info } from '@/app/_ui/components';
import { ProjectDescription } from '@/app/_ui/components/project-description';

type TTokenMetricsProps = {
  token: string;
  targetRaiseRange: string;
  totalSupply: string;
  targetedDate: Date;
  contractAddress: string;
};

const TokenMetrics = ({
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

type TProjectProps = {
  params: {
    id: string;
  };
};

export default function Project({ params }: TProjectProps) {
  if (params.id !== 'citizend') {
    return '404 Not Found';
  }

  return (
    <main className="grid grid-cols-1 gap-x-17 gap-y-9 px-31 lg:grid-cols-2">
      <div className="max-w-2xl max-w-prose">
        <Image
          src="/citizend-logo-circle.svg"
          alt="Citizend Logo"
          width={80}
          height={80}
          priority
        />
        <h3 className="mt-6">Citizend Community Sale</h3>
        <p className="pt-2">
          A Polkadot-native token launch platform, by and for the community
        </p>
        <ProjectDescription />
        <div className="mb-9 mt-12 border-t border-grey" />
        <h4 className="mb-8 font-semibold uppercase">Description</h4>
        <p>
          Citizend brings top projects and contributors together to equitably
          catalyze growth in the Polkadot ecosystem. Get pitched by pre-screened
          projects before they list their tokens and vote—one vote per
          member—for the most promising one.
        </p>
        <br />
        <p>
          No matter if you have $2M $CTND tokens or $200 you get an equal vote
          in what projects launch. Have your voice heard and rally community
          support for projects you love.
        </p>
        <br />
        <p>
          If you vote for winning projects, you get an early stake in the
          project. Setting the standard for a more fair, safe, and transparent
          contribution.
        </p>
        <br />
        <p>
          Citizend is a Polkadot-native token launch platform backed by a
          status-free community that leads the curation of projects to ensure
          fairness, transparency, and true project value.
        </p>
        <br />
        <p>
          Citizend offers projects access to community support as well as
          liquidity, setting token-launching projects up for success within the
          Polkadot ecosystem.
        </p>
      </div>
      <div className="lg:pt-27">
        <TokenMetrics
          token={'RDF'}
          targetRaiseRange="2.M - 8M ETH"
          totalSupply="800 000 000 RDF"
          targetedDate={new Date('2024-04-29')}
          contractAddress="0x02323430947"
        />
        <div className="mt-9">
          <Info />
        </div>
      </div>
    </main>
  );
}
