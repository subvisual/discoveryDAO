'use client';
import { Button } from '..';
import { PublicInfo } from '@/app/_server/types';
import { useIdOS } from '@/app/_providers/idos';
import { useAcquireAccessGrantMutation } from '@/app/_lib/actions';

type AcquireAccessGrantButton = {
  id: string;
  serverInfo: PublicInfo;
};

export const AcquireAccessGrantButton = ({ id }: { id: string }) => {
  const { sdk } = useIdOS();
  const acquireAccessGrant = useAcquireAccessGrantMutation();

  if (!sdk) return null;

  const onClick = async () => {
    try {
      const grant = await acquireAccessGrant.mutateAsync({
        id,
      });
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

  return <Button onClick={onClick}>Create Access Grant</Button>;
};
