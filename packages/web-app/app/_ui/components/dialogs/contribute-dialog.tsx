'use client';

import { useFetchGrants, useFetchKycData } from '@/app/_lib/queries';
import { useIdOS } from '@/app/_providers/idos';
import { Dialog } from '@headlessui/react';
import { AcquireAccessGrantButton } from './acquire-access-grant-button';
import { getProviderUrl } from '@/app/_providers/idos/get-provider-url';
import Link from 'next/link';
import { Button } from '..';
import { useDialog } from '@/app/_providers/dialog/context';

type TVerifyYourIdProps = {
  address: string;
  close: () => void;
};

const VerifyYourId = ({ address, close }: TVerifyYourIdProps) => {
  return (
    <div>
      <div className="mt-3 text-center sm:mt-5">
        <Dialog.Title as="h2" className="text-gray-900">
          Verify your ID
        </Dialog.Title>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            To be able to Contribute to this project, you must complete ID basic
            verification.
          </p>
        </div>
        <Link href={getProviderUrl(address)} className="mt-8">
          Verify my ID on IdOs to contribute
        </Link>
        <Button variant="secondary" onClick={close}>
          Skip for now
        </Button>
      </div>
    </div>
  );
};

type TUnlockIdosProps = {
  authenticate: () => void;
  close: () => void;
};

const UnlockIdos = ({ authenticate, close }: TUnlockIdosProps) => {
  return (
    <div>
      <div className="mt-3 text-center sm:mt-5">
        <Dialog.Title as="h2" className="text-gray-900">
          Verify your ID
        </Dialog.Title>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            To be able to Contribute to this project, you must complete ID basic
            verification.
          </p>
        </div>
        <Button className="mt-8" onClick={authenticate}>
          Unlock idOS verification
        </Button>
        <Button variant="secondary" onClick={close}>
          Skip for now
        </Button>
      </div>
    </div>
  );
};

type TCloseProp = {
  close: () => void;
};

// TODO: Add Rejected scenario
const PendingApproval = ({ close }: TCloseProp) => {
  return (
    <div>
      <div className="mt-3 text-center sm:mt-5">
        <Dialog.Title as="h2" className="text-gray-900">
          Verify your ID
        </Dialog.Title>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Your kyc is being reviewed. Please try again later.
          </p>
        </div>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </div>
    </div>
  );
};

const BlockedCountry = ({ close }: TCloseProp) => {
  return (
    <div>
      <div className="mt-3 text-center sm:mt-5">
        <Dialog.Title as="h2" className="text-gray-900">
          Ooops
        </Dialog.Title>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Sadly you are not allowed to contribute to this project due to
            country restrictions.
          </p>
        </div>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </div>
    </div>
  );
};

type TIssueAccessGrantProps = {
  id: string;
  close: () => void;
};

const IssueAccessGrant = ({ id, close }: TIssueAccessGrantProps) => {
  return (
    <div>
      <div className="mt-3 text-center sm:mt-5">
        <Dialog.Title as="h2" className="text-gray-900">
          Verify your ID
        </Dialog.Title>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            You have successfully verified your ID. Issue an Access Grant to
            citizend so you can contribute to this project.
          </p>
        </div>
        <div className="mt-8 flex flex-col">
          <AcquireAccessGrantButton id={id} />
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const UnlockedIdos = () => {
  const { country, id, approved } = useFetchKycData();
  const { data: grants } = useFetchGrants();

  if (!approved) return <PendingApproval close={close} />;

  if (country !== 'PT') return <BlockedCountry close={close} />;

  console.log(
    '%c==>',
    'color: green; background: yellow; font-size: 20px',
    grants,
  );

  if (id && grants && grants.length < 6)
    return <IssueAccessGrant id={id} close={close} />;

  return (
    <div>
      <div className="mt-3 text-center sm:mt-5">
        <Dialog.Title as="h3" className="text-gray-900">
          Contributing to:
        </Dialog.Title>
        <div className="mt-2">
          <p className="text-sm text-gray-500">---- Contribution form ----</p>
        </div>
      </div>
    </div>
  );
};

export const ContributeDialog = () => {
  const { close } = useDialog();
  const { hasSigned, address, hasProfile, authenticate } = useIdOS();

  if (!address)
    return (
      <Button className="rounded-none rounded-b-lg" onClick={close}>
        Connect wallet first
      </Button>
    );

  if (!hasProfile) {
    return <VerifyYourId address={address} close={close} />;
  }

  if (!hasSigned) {
    return <UnlockIdos authenticate={authenticate} close={close} />;
  }

  return <UnlockedIdos />;
};

ContributeDialog.displayName = 'contributeDialog';
