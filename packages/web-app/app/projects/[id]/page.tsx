import { getPublicInfo } from '@/app/server/idos';
import { Content } from './content';

type TPageProps = {
  params: {
    id: string;
  };
};

export default async function Page(props: TPageProps) {
  const serverInfo = await getPublicInfo();

  return <Content serverInfo={serverInfo} {...props} />;
}
