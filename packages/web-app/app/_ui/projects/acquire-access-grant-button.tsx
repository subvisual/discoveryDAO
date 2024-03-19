'use client';
import { Button } from '../components';
import { PublicInfo } from '@/app/_server/types';
import { useIdOS } from '@/app/_providers/idos';
import { useAcquireAccessGrantMutation } from '@/app/_lib/actions';

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
  const acquireAccessGrant = useAcquireAccessGrantMutation();

  if (!sdk || !serverInfo) return null;

  const onClick = async () => {
    try {
      const grant = await acquireAccessGrant.mutateAsync({
        id,
        serverInfo,
      });

      console.log(
        '%c==>GRANT',
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

  if (acquireAccessGrant.isPending)
    return (
      <Button variant="primary-disabled" disabled>
        Creating...
      </Button>
    );

  return <Button onClick={onClick}>Create AC to this app</Button>;
};
