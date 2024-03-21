import { InfoWithServerDetails } from '@/app/_ui/projects/info-with-server-details';
import { ProjectDescription } from '@/app/_ui/projects/project-description';
import { TokenMetrics } from '@/app/_ui/projects/token-metrics';
import { Suspense } from 'react';

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
      <ProjectDescription />
      <div className="lg:pt-27">
        <TokenMetrics
          token="CTND"
          targetRaiseRange="2.M - 8M ETH"
          totalSupply="800 000 000 CTND"
          targetedDate={new Date('2024-04-29')}
          contractAddress="0x02323430947"
        />
      </div>
    </main>
  );
}
