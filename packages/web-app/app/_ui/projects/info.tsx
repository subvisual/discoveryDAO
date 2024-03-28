'use client';

import { Button } from '../components/button';
import { useIdOS } from '@/app/_providers/idos';
import { IdosInfo } from './idos-info';
import { PublicInfo } from '@/app/_server/types';

type TInfoProps = {
  serverInfo: PublicInfo;
};

export function Info({ serverInfo }: TInfoProps) {
  const { address, hasProfile } = useIdOS();

  if (!hasProfile) return null;

  return (
    <div className="grid grid-cols-1 gap-2">
      <IdosInfo serverInfo={serverInfo} />
    </div>
  );
}
