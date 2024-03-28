'use client';

import { useIdOS } from '@/app/_providers/idos';
import { Button } from '../components';
import { ContributeDialog } from '../components/dialogs';
import { useDialog } from '@/app/_providers/dialog/context';

export const ContributeButton = () => {
  const { address } = useIdOS();
  const { open } = useDialog();

  if (!address)
    return (
      <Button
        disabled
        className="rounded-none rounded-b-lg"
        variant="primary-disabled"
      >
        Connect wallet first
      </Button>
    );

  return (
    <Button
      className="rounded-none rounded-b-lg"
      onClick={() => open(ContributeDialog.displayName)}
    >
      Contribute
    </Button>
  );
};
