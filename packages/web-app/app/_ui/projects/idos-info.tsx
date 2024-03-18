'use client';

import { useAccount } from 'wagmi';
import { Button } from '../components/button';
import { useIdOS } from '@/app/_providers/idos';
import { useState } from 'react';
import { idOS } from '@idos-network/idos-sdk';
import { useFetchCredentials, useFetchWallets } from '@/app/_lib/queries';
import { PublicInfo } from '@/app/_server/types';
import { AcquireAccessGrantButton } from './acquire-access-grant-button';
import { Grants } from './grants';

const json = (object) => {
  return JSON.stringify(object, '', 2).replace(/"(data:.*?;).*/g, '$1 (...)');
};

type TIdosInfoProps = {
  serverInfo: PublicInfo;
};

export const IdosInfo = ({ serverInfo }: TIdosInfoProps) => {
  const [contentStr, setContentStr] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const { address } = useAccount();
  const { sdk } = useIdOS();
  const { data, isError, isLoading } = useFetchCredentials();
  const { data: wallets } = useFetchWallets();
  // const { data: credentials } = useFetchCredentials();

  console.log(
    '%c==>',
    'color: green; background: yellow; font-size: 20px',
    serverInfo,
  );

  console.log(
    '%c==>Credentials',
    'color: green; background: yellow; font-size: 20px',
    data,
  );

  return (
    <div className="mt-2">
      <h3>Idos</h3>
      <h4 className="my-4 font-semibold">Wallets</h4>
      {wallets?.map((wallet) => (
        <div key={wallet.id}>
          <p>
            <span>Id: </span>
            {wallet.id}
          </p>
          <p>
            <span>Address: </span>
            {wallet.address}
          </p>
        </div>
      ))}
      <h4 className="mt-6 font-semibold">Credentials</h4>
      {data?.map((credential) => (
        <div key={credential.id} className="flex flex-col gap-2 py-4">
          <p>
            <span>Id: </span>
            <Button
              className="p-0"
              onClick={async () => {
                if (!sdk) return;

                try {
                  const _credential = await sdk.data.get(
                    'credentials',
                    credential.id,
                  );

                  if (!_credential) return;
                  const { content } = _credential;

                  console.log(
                    '%c==>Credential',
                    'color: green; background: yellow; font-size: 20px',
                    content,
                  );

                  const verified =
                    await idOS.verifiableCredentials.verify(content);

                  console.log(
                    '%c==>Verify Credential:',
                    'color: green; background: yellow; font-size: 20px',
                    verified,
                  );

                  setContentStr(JSON.parse(content));
                  setCredentialId(credential.id);
                } catch (error) {
                  console.log(
                    '%c==>',
                    'color: green; background: yellow; font-size: 20px',
                    error,
                  );
                }

                // try {
                //   const result = await sdk.grants.list({
                //     owner: address,
                //     // grantee: fakeServer.publicInfo.granteeAddress,
                //   });

                //   console.log(
                //     '%c==>GRANTS',
                //     'color: green; background: yellow; font-size: 20px',
                //     result,
                //   );
                // } catch (error) {}
              }}
            >
              {credential.id}
            </Button>
          </p>
          <p>
            <span>Level: </span>
            {credential.credential_level}
          </p>
          <p>
            <span>Status: </span>
            {credential.credential_status}
          </p>
        </div>
      ))}
      {credentialId ? (
        <AcquireAccessGrantButton id={credentialId} serverInfo={serverInfo} />
      ) : null}
      {contentStr ? <pre className="mt-5">${json(contentStr)}</pre> : null}
      <Grants serverInfo={serverInfo} />
    </div>
  );
};
