'use client';

import { Button } from './button';
import { useIdOS } from '@/app/_providers/idos';
import { IdosInfo } from './idos-info';
import { PublicInfo } from '@/app/server/types';

type TInfoProps = {
  serverInfo: PublicInfo;
};

export function Info({ serverInfo }: TInfoProps) {
  const { hasSigned, authenticate, address } = useIdOS();

  if (!address) return null;

  return (
    <div className="grid grid-cols-1 gap-2">
      {hasSigned ? (
        <IdosInfo serverInfo={serverInfo} />
      ) : (
        <Button onClick={authenticate}>Check KYC status</Button>
      )}
    </div>
  );
}
