'use client';

import { useFetchGrants } from '@/app/_lib/queries';
import { PublicInfo } from '@/app/_server/types';
import { Button } from '../components/button';
import { getAccessGrantsContentDecrypted } from '@/app/_server/idos';
import { useFormState } from 'react-dom';

type TGrantsProps = {
  serverInfo: PublicInfo;
};

type TJson = {
  [key: string]: any;
};

const json = (object: TJson) => {
  return JSON.stringify(object, () => '', 2).replace(
    /"(data:.*?;).*/g,
    '$1 (...)',
  );
};

// TEST COMPONENT - NOT FINAL, JUST TO DECRYPT THE GRANTS
const DecryptButton = ({ dataId }: { dataId: string }) => {
  const initialState: { content: string; errors: any } = {
    content: '',
    errors: {},
  };
  const getAccessGrants = getAccessGrantsContentDecrypted.bind(null, dataId);
  const [state, dispatch] = useFormState(getAccessGrants, initialState);

  return (
    <>
      <form action={dispatch}>
        <Button type="submit">Decrypt</Button>
      </form>
      {state?.content ? (
        <pre className="mt-5 flex overflow-auto bg-slate-400">
          ${json(JSON.parse(state.content))}
        </pre>
      ) : null}
    </>
  );
};

export const Grants = ({ serverInfo }: TGrantsProps) => {
  const { data: grants } = useFetchGrants();

  if (!grants?.length) return null;

  return (
    <div>
      <h4 className="mt-6 font-medium">Grants</h4>
      {grants?.map((grant) => (
        <div key={grant.dataId} className="flex flex-col gap-2 py-4">
          <p>
            <span>DataId: </span>
            {grant.dataId}
          </p>
          <p>
            <span>Owner: </span>
            {grant.owner}
          </p>
          <DecryptButton dataId={grant.dataId} />
        </div>
      ))}
    </div>
  );
};
