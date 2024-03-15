'use client';
import { Button } from '.';
import { PublicInfo } from '@/app/server/types';
import { useIdOS } from '@/app/_providers/idos';

type AcquireAccessGrantButton = {
  id: string;
  serverInfo: PublicInfo;
};

export const AcquireAccessGrantButton = ({
  id,
  serverInfo,
}: {
  id: string;
  serverInfo: PublicInfo;
}) => {
  const { sdk } = useIdOS();

  if (!sdk || !serverInfo) return null;

  const onClick = async () => {
    try {
      const grant = await sdk.grants.create(
        'credentials',
        id,
        serverInfo.grantee,
        Math.floor(Date.now() / 1000) + serverInfo.lockTimeSpanSeconds,
        serverInfo.encryptionPublicKey,
      );
      console.log(
        '%c==>',
        'color: green; background: yellow; font-size: 20px',
        grant,
      );
    } catch (error) {
      console.log(
        '%c==>',
        'color: green; background: red; font-size: 20px',
        error,
      );
    }
  };

  return <Button onClick={onClick}>Create AC to this app</Button>;
};
