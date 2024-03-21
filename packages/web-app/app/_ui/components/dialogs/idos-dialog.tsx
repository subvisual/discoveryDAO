'use client';

import { Dialog } from '@headlessui/react';
import { Button } from '..';

export function IdosDialog() {
  // const { close } = useDialog();

  return (
    <>
      <div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title as="h2" className="text-gray-900">
            Verify your ID
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              To be able to Contribue to this project, you must complete ID
              basic verification.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center sm:mt-6">
        <Button>Check KYC status</Button>
        <Button variant="secondary" className="mt-3" onClick={close}>
          Skip for now
        </Button>
      </div>
    </>
  );
}

IdosDialog.displayName = 'idosDialog';
