'use client';

import { useState, useEffect } from 'react';
import { useReadProjectDescription } from '@/wagmi.generated';
import Image from 'next/image';

export const ProjectDescription = () => {
  const [isSSR, setIsSSR] = useState(true);
  const { data, isLoading } = useReadProjectDescription();

  useEffect(() => {
    setIsSSR(false);
  }, []);

  if (isSSR || isLoading) return <p className="load">Loading...</p>;

  return (
    <div className="max-w-2xl max-w-prose text-white">
      <Image
        src="/citizend-logo-circle.svg"
        alt="Citizend Logo"
        width={80}
        height={80}
        priority
      />
      <h2 className="mt-6">Citizend Community Sale</h2>
      <p className="pt-2">
        A Polkadot-native token launch platform, by and for the community
      </p>
      <p>{data}</p>
      <div className="border-white-anti-flash mb-9 mt-12 border-t" />
      <h3 className="mb-8">Description</h3>
      <p>
        Citizend brings top projects and contributors together to equitably
        catalyze growth in the Polkadot ecosystem. Get pitched by pre-screened
        projects before they list their tokens and vote—one vote per member—for
        the most promising one.
      </p>
      <br />
      <p>
        No matter if you have $2M $CTND tokens or $200 you get an equal vote in
        what projects launch. Have your voice heard and rally community support
        for projects you love.
      </p>
      <br />
      <p>
        If you vote for winning projects, you get an early stake in the project.
        Setting the standard for a more fair, safe, and transparent
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
  );
};
